import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Palette } from "lucide-react";
import { AdvancedFilter, FilterOptions } from "@/components/AdvancedFilter";
import { cn } from "@/lib/utils";
import { photoGridContainerVariants, photoGridItemVariants } from "@/lib/animations";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import Lightbox from "@/components/Lightbox";

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

interface Category {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  isVisible: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PortfolioGridProps {
  photos: Photo[];
  categories: Category[];
  projects: Project[];
  isLoading: boolean;
  advancedFilters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableLocations: string[];
  availableYears: string[];
}

export function PortfolioGrid({
  photos,
  categories,
  projects,
  isLoading,
  advancedFilters,
  onFiltersChange,
  availableLocations,
  availableYears,
}: PortfolioGridProps) {
  const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isGrayscale, setIsGrayscale] = useState<boolean>(() => {
    const saved = localStorage.getItem('photoViewMode');
    return saved === 'grayscale';
  });

  const handleCategoryClick = (cat: string) => {
    onFiltersChange({ ...advancedFilters, category: cat });
  };

  return (
    <>
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
                onFiltersChange={onFiltersChange}
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
          variants={photoGridContainerVariants}
          initial="hidden"
          animate="visible"
          layout
          className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 md:gap-8"
        >
          <AnimatePresence>
            {photos.map((photo, index) => (
              <motion.div
                layout
                variants={photoGridItemVariants}
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
                  loading={index < 9 ? "eager" : "lazy"}
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

      <AnimatePresence>
        {selectedPhoto && (
          <Lightbox 
            photo={selectedPhoto} 
            onClose={() => setSelectedPhoto(null)}
            onNext={() => {
              const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
              if (currentIndex < photos.length - 1) {
                setSelectedPhoto(photos[currentIndex + 1]);
              }
            }}
            onPrev={() => {
              const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
              if (currentIndex > 0) {
                setSelectedPhoto(photos[currentIndex - 1]);
              }
            }}
            hasNext={photos.findIndex(p => p.id === selectedPhoto.id) < photos.length - 1}
            hasPrev={photos.findIndex(p => p.id === selectedPhoto.id) > 0}
            nextPhotoSrc={
              photos.findIndex(p => p.id === selectedPhoto.id) < photos.length - 1
                ? photos[photos.findIndex(p => p.id === selectedPhoto.id) + 1].src
                : undefined
            }
            prevPhotoSrc={
              photos.findIndex(p => p.id === selectedPhoto.id) > 0
                ? photos[photos.findIndex(p => p.id === selectedPhoto.id) - 1].src
                : undefined
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}
