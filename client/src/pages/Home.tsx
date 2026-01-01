import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { ReviewsSection } from "@/components/ReviewsSection";
import { BookingSection } from "@/components/BookingSection";
import { reviews } from "@/lib/data";
import { FilterOptions } from "@/components/AdvancedFilter";
import { shuffleArray } from "@/lib/utils";

type Photo = {
  id: number;
  src: string;
  alt: string;
  category: string;
  location: string | null;
  date: string | null;
  description: string | null;
  displayTitle: string | null;
  camera: string | null;
  lens: string | null;
  settings: string | null;
  featured: number;
  collaboratorId: number | null;
  collaborators?: Array<{
    id: number | null;
    name: string | null;
    slug: string | null;
    instagram: string | null;
  }>;
  isVisible: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function Home() {
  // Auth state
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  // Filter state
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    category: "All",
    location: "All",
    year: "All",
    project: "All",
  });

  // Fetch photos from backend API
  const { data: photosRaw = [], isLoading } = trpc.photos.list.useQuery();
  
  // Randomize photos on mount using shared utility
  const photos = useMemo(() => {
    return photosRaw.length > 0 ? shuffleArray(photosRaw) : [];
  }, [photosRaw]);
  
  // Fetch categories from backend API
  const { data: categories = [] } = trpc.photoCategories.list.useQuery();
  
  // Fetch projects from backend API
  const { data: projects = [] } = trpc.projects.list.useQuery();
  
  // Fetch hero slides and quotes
  const { data: heroSlidesRaw = [] } = trpc.hero.getActiveSlides.useQuery();
  const { data: heroQuotes = [] } = trpc.hero.getActiveQuotes.useQuery();
  
  // Randomize hero slides on mount using shared utility
  const heroSlides = useMemo(() => {
    return heroSlidesRaw.length > 0 ? shuffleArray(heroSlidesRaw) : [];
  }, [heroSlidesRaw]);

  // Extract unique locations and years from photos
  const availableLocations = useMemo(() => {
    return Array.from(
      new Set(photos.map(p => p.location).filter(Boolean))
    ).sort() as string[];
  }, [photos]);
  
  const availableYears = useMemo(() => {
    return Array.from(
      new Set(photos.map(p => p.date ? new Date(p.date).getFullYear().toString() : null).filter(Boolean))
    ).sort((a, b) => Number(b) - Number(a)) as string[];
  }, [photos]);

  // Get photos by project if project filter is active
  const [projectPhotos, setProjectPhotos] = useState<number[]>([]);
  
  // Fetch project photos when project filter changes
  useEffect(() => {
    if (advancedFilters.project !== "All") {
      const projectId = parseInt(advancedFilters.project);
      const project = projects.find(p => p.id === projectId);
      if (project && (project as any).photos) {
        setProjectPhotos((project as any).photos.map((p: any) => p.id));
      }
    } else {
      setProjectPhotos([]);
    }
  }, [advancedFilters.project, projects]);

  // Apply filters
  const filteredPhotos = photos.filter(photo => {
    // Project filter (most specific)
    if (advancedFilters.project !== "All") {
      if (!projectPhotos.includes(photo.id)) {
        return false;
      }
    }
    
    // Category filter
    if (advancedFilters.category !== "All" && photo.category !== advancedFilters.category) {
      return false;
    }
    
    // Location filter
    if (advancedFilters.location !== "All" && photo.location !== advancedFilters.location) {
      return false;
    }
    
    // Year filter
    if (advancedFilters.year !== "All") {
      const photoYear = photo.date ? new Date(photo.date).getFullYear().toString() : null;
      if (photoYear !== advancedFilters.year) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-white selection:text-black">
      <Navigation />

      <HeroSection heroSlides={heroSlides} heroQuotes={heroQuotes} />

      <PortfolioGrid
        photos={filteredPhotos}
        categories={categories}
        projects={projects}
        isLoading={isLoading}
        advancedFilters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        availableLocations={availableLocations}
        availableYears={availableYears}
      />

      <ReviewsSection reviews={reviews} />

      <BookingSection />

      <Footer />
    </div>
  );
}
