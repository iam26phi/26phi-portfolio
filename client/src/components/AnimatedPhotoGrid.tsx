import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { photoItemVariants } from "@/lib/animations";

type Photo = {
  id: number;
  src: string;
  alt: string;
  category?: string;
  location?: string | null;
  date?: string | null;
  description?: string | null;
};

type AnimatedPhotoGridProps = {
  photos: Photo[];
  isGrayscale?: boolean;
  onPhotoClick?: (photo: Photo) => void;
  className?: string;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
};

/**
 * Animated photo grid component with consistent animations
 * Uses framer-motion for smooth enter/exit animations
 * Supports masonry layout with responsive columns
 */
export function AnimatedPhotoGrid({
  photos,
  isGrayscale = false,
  onPhotoClick,
  className,
  columns = { default: 1, sm: 2, lg: 3 },
}: AnimatedPhotoGridProps) {
  const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);

  // Build column classes based on columns prop
  const columnClasses = [
    `columns-${columns.default || 1}`,
    columns.sm && `sm:columns-${columns.sm}`,
    columns.md && `md:columns-${columns.md}`,
    columns.lg && `lg:columns-${columns.lg}`,
    columns.xl && `xl:columns-${columns.xl}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div layout className={cn(columnClasses, "gap-4 sm:gap-6 md:gap-8", className)}>
      <AnimatePresence>
        {photos.map((photo) => (
          <motion.div
            layout
            variants={photoItemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            key={photo.id}
            className="relative group break-inside-avoid cursor-pointer overflow-hidden mb-4 sm:mb-6 md:mb-8"
            onMouseEnter={() => setHoveredPhoto(photo.id)}
            onMouseLeave={() => setHoveredPhoto(null)}
            onClick={() => onPhotoClick?.(photo)}
          >
            <motion.img
              layoutId={`image-${photo.id}`}
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              className={cn(
                "w-full h-auto transition-all duration-700 ease-out scale-100 group-hover:scale-105",
                isGrayscale ? "grayscale group-hover:grayscale-0" : ""
              )}
            />

            <div
              className={cn(
                "absolute inset-0 bg-black/60 flex flex-col justify-end p-3 sm:p-4 md:p-6 transition-opacity duration-300",
                hoveredPhoto === photo.id ? "opacity-100" : "opacity-0"
              )}
            >
              {(photo.category || photo.location || photo.date) && (
                <p className="text-[10px] sm:text-xs font-mono text-neutral-400 mb-1 sm:mb-2">
                  {[photo.category, photo.location, photo.date].filter(Boolean).join(" · ")}
                </p>
              )}
              <h3 className="text-sm sm:text-base md:text-lg font-bold tracking-tight">
                {photo.alt}
              </h3>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
