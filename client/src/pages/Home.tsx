import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Lightbox from "@/components/Lightbox";
import { reviews } from "@/lib/data";
import { ArrowRight, Star, Loader2, Palette } from "lucide-react";
import { AdvancedFilter, FilterOptions } from "@/components/AdvancedFilter";
import { cn } from "@/lib/utils";
import { AnimatedPhotoGrid } from "@/components/AnimatedPhotoGrid";
import { photoItemVariants } from "@/lib/animations";
import { ProgressiveImage } from "@/components/ProgressiveImage";

type Category = "All" | string;
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
  collaboratorId: number | null; // Kept for backward compatibility
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
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    category: "All",
    location: "All",
    year: "All",
    project: "All",
  });
  const [isGrayscale, setIsGrayscale] = useState<boolean>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('photoViewMode');
    return saved === 'grayscale';
  });

  // Fetch photos from backend API
  const { data: photos = [], isLoading } = trpc.photos.list.useQuery();
  
  // Fetch categories from backend API
  const { data: categories = [] } = trpc.photoCategories.list.useQuery();
  
  // Fetch projects from backend API
  const { data: projects = [] } = trpc.projects.list.useQuery();
  
  // Fetch hero slides and quotes
  const { data: heroSlides = [] } = trpc.hero.getActiveSlides.useQuery();
  const { data: heroQuotes = [] } = trpc.hero.getActiveQuotes.useQuery();
  
  // Select a random quote on mount
  const [currentQuote, setCurrentQuote] = useState<{ textZh: string; textEn: string } | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  useEffect(() => {
    if (heroQuotes.length > 0 && !currentQuote) {
      const randomQuote = heroQuotes[Math.floor(Math.random() * heroQuotes.length)];
      setCurrentQuote({ textZh: randomQuote.textZh, textEn: randomQuote.textEn });
    }
  }, [heroQuotes, currentQuote]);
  
  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroSlides.length]);
  
  // Fallback to default background if no slides
  const currentSlide = heroSlides.length > 0 ? heroSlides[currentSlideIndex] : null;
  const heroBackgroundUrl = currentSlide?.imageUrl || "https://d2xsxph8kpxj0f.cloudfront.net/310519663123146573/3s8FCUF9BWUfzRwVV77JBG/hero-bg-real.jpg";

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

  // Sync activeCategory with advancedFilters
  const handleCategoryClick = useCallback((cat: Category) => {
    setActiveCategory(cat);
    setAdvancedFilters(prev => ({ ...prev, category: cat }));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-white selection:text-black">
      <Navigation />

      {/* Hero Section with Carousel */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background Carousel */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <motion.img 
                src={heroBackgroundUrl}
                alt="Hero Background" 
                className="w-full h-full object-cover opacity-40"
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 10, ease: "linear" }}
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 h-full flex flex-col justify-center items-start">
          {/* Dynamic Quote */}
          {currentQuote && (
            <motion.h1 
              key={currentQuote.textZh}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-tight mb-4 sm:mb-6 mix-blend-difference"
            >
              {currentQuote.textZh.split('，').map((line, i) => (
                <span key={i} className="block">{line}{i === 0 ? '，' : ''}</span>
              ))}
            </motion.h1>
          )}
          
          {currentQuote && (
            <motion.p 
              key={currentQuote.textEn}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl font-mono max-w-md text-neutral-300 mb-8 sm:mb-12"
            >
              "{currentQuote.textEn}"
            </motion.p>
          )}

          <motion.a
            href="#portfolio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="group flex items-center gap-2 sm:gap-4 text-white font-mono tracking-widest text-xs sm:text-sm hover:text-neutral-300 transition-colors"
          >
            EXPLORE WORKS
            <ArrowRight className="group-hover:translate-x-2 transition-transform w-4 h-4 sm:w-5 sm:h-5" />
          </motion.a>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 1.2, duration: 0.8 },
            y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-xs font-mono tracking-widest">SCROLL</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent" />
        </motion.div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-16 sm:py-24 md:py-32 container">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        )}
        {!isLoading && (
        <>
        <div className="flex flex-col gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter">工作記錄</h2>
          
          <div className="flex flex-col gap-4">
            {/* Category Filter */}
            <div className="flex gap-4 sm:gap-6 md:gap-8 font-mono text-xs sm:text-sm tracking-widest overflow-x-auto pb-2 scrollbar-hide">
              {[{ name: "All", slug: "All" }, ...categories].map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={cn(
                    "hover:line-through decoration-1 underline-offset-4 transition-all whitespace-nowrap",
                    advancedFilters.category === cat.slug ? "line-through text-white" : "text-neutral-500"
                  )}
                >
                  {cat.name.toUpperCase()}
                </button>
              ))}
            </div>
            
            {/* Advanced Filters */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <AdvancedFilter
                filters={advancedFilters}
                onFiltersChange={setAdvancedFilters}
                availableLocations={availableLocations}
                availableYears={availableYears}
                availableCategories={categories}
                availableProjects={projects}
              />
              <button
                onClick={() => {
                  const newMode = !isGrayscale;
                  setIsGrayscale(newMode);
                  localStorage.setItem('photoViewMode', newMode ? 'grayscale' : 'color');
                }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors text-xs sm:text-sm font-mono"
              >
                <Palette size={14} className="sm:w-4 sm:h-4" />
                {isGrayscale ? '黑白' : '彩色'}
              </button>
            </div>
          </div>
        </div>

        <motion.div 
          layout
          className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 md:gap-8"
        >
          <AnimatePresence>
            {filteredPhotos.map((photo) => (
              <motion.div
                layout
                variants={photoItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                key={photo.id}
                className={cn(
                  "relative group break-inside-avoid cursor-pointer overflow-hidden mb-4 sm:mb-6 md:mb-8",
                  photo.featured === 1 && "col-span-1 sm:col-span-2 lg:col-span-1"
                )}
                onMouseEnter={() => setHoveredPhoto(photo.id)}
                onMouseLeave={() => setHoveredPhoto(null)}
                onClick={() => setSelectedPhoto(photo)}
              >
                <ProgressiveImage
                  src={photo.src}
                  alt={photo.alt}
                  rootMargin="200px"
                  className={cn(
                    "w-full h-auto transition-all duration-700 ease-out scale-100 group-hover:scale-105",
                    isGrayscale ? "grayscale group-hover:grayscale-0" : ""
                  )}
                />
                
                <div className={cn(
                  "absolute inset-0 bg-black/60 flex flex-col justify-end p-3 sm:p-4 md:p-6 transition-opacity duration-300",
                  hoveredPhoto === photo.id ? "opacity-100" : "opacity-0"
                )}>
                  {(photo.category || photo.location || photo.date) && (
                    <p className="text-[10px] sm:text-xs font-mono text-neutral-400 mb-1 sm:mb-2">
                      {[photo.category, photo.location, photo.date].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <h3 className="text-sm sm:text-base md:text-lg font-bold tracking-tight">
                    {photo.displayTitle || photo.alt}
                  </h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        </>
        )}
      </section>

      {/* Reviews Section */}
      <section className="py-16 sm:py-24 md:py-32 bg-neutral-900 text-white">
        <div className="container">
          <h2 className="text-xs sm:text-sm font-mono tracking-widest text-neutral-500 mb-8 sm:mb-12 md:mb-16">CLIENT WORDS</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
            {reviews.map((review) => (
              <div key={review.id} className="flex flex-col gap-6">
                <div className="flex gap-1 text-white">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xl leading-relaxed font-light text-neutral-300">
                  "{review.text}"
                </p>
                <div>
                  <p className="font-bold">{review.name}</p>
                  <p className="text-sm text-neutral-500 font-mono">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-32 container flex flex-col items-center text-center">
        <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8">
          LET'S CREATE <br /> TOGETHER
        </h2>
        <p className="text-neutral-400 max-w-xl mb-12 text-lg">
          Available for portraits, editorials, and travel assignments in Taiwan and Tokyo.
        </p>
        <a 
          href="mailto:contact@26phi.com"
          className="px-12 py-4 bg-white text-black font-bold tracking-widest hover:bg-neutral-200 transition-colors"
        >
          BOOK A SESSION
        </a>
      </section>

      <Footer />

      <AnimatePresence>
        {selectedPhoto && (
          <Lightbox 
            photo={selectedPhoto} 
            onClose={() => setSelectedPhoto(null)}
            onNext={() => {
              const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
              if (currentIndex < filteredPhotos.length - 1) {
                setSelectedPhoto(filteredPhotos[currentIndex + 1]);
              }
            }}
            onPrev={() => {
              const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
              if (currentIndex > 0) {
                setSelectedPhoto(filteredPhotos[currentIndex - 1]);
              }
            }}
            hasNext={filteredPhotos.findIndex(p => p.id === selectedPhoto.id) < filteredPhotos.length - 1}
            hasPrev={filteredPhotos.findIndex(p => p.id === selectedPhoto.id) > 0}
            nextPhotoSrc={
              filteredPhotos.findIndex(p => p.id === selectedPhoto.id) < filteredPhotos.length - 1
                ? filteredPhotos[filteredPhotos.findIndex(p => p.id === selectedPhoto.id) + 1].src
                : undefined
            }
            prevPhotoSrc={
              filteredPhotos.findIndex(p => p.id === selectedPhoto.id) > 0
                ? filteredPhotos[filteredPhotos.findIndex(p => p.id === selectedPhoto.id) - 1].src
                : undefined
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
