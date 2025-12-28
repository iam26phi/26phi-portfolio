import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type Photo = {
  id: number;
  src: string;
  alt: string;
  category: string;
  location: string | null;
  date: string | null;
  description: string | null;
  isVisible: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

interface LightboxProps {
  photo: Photo;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  nextPhotoSrc?: string;
  prevPhotoSrc?: string;
  isGrayscale?: boolean;
}

export default function Lightbox({ photo, onClose, onNext, onPrev, hasNext, hasPrev, nextPhotoSrc, prevPhotoSrc, isGrayscale = false }: LightboxProps) {
  // Swipe Handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && hasNext) {
      onNext();
    }
    if (isRightSwipe && hasPrev) {
      onPrev();
    }
  };

  // Preload Images
  useEffect(() => {
    if (nextPhotoSrc) {
      const img = new Image();
      img.src = nextPhotoSrc;
    }
    if (prevPhotoSrc) {
      const img = new Image();
      img.src = prevPhotoSrc;
    }
  }, [nextPhotoSrc, prevPhotoSrc]);

  // Handle Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasNext) onNext();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-2 md:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50 p-2"
      >
        <X size={32} />
      </button>

      {/* Navigation Buttons */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-50 p-2"
        >
          <ChevronLeft size={48} strokeWidth={1} />
        </button>
      )}
      
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-50 p-2"
        >
          <ChevronRight size={48} strokeWidth={1} />
        </button>
      )}

      <div
        className="relative w-full h-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 px-2 md:px-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative flex-1 w-full h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              src={photo.src}
              alt={photo.alt}
              className={`w-full h-full object-contain shadow-2xl ${isGrayscale ? 'grayscale' : ''}`}
              style={{ maxHeight: 'calc(100vh - 2rem)', maxWidth: '100%' }}
            />
          </AnimatePresence>
        </div>

        <motion.div
          key={`info-${photo.id}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-full md:w-[240px] lg:w-[280px] flex flex-col gap-4 text-white shrink-0"
        >
          <div>
            <p className="text-xs font-mono text-neutral-500 mb-2 tracking-widest uppercase">
              {photo.category}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter leading-none text-white">
              {photo.alt}
            </h2>
          </div>

          <div className="h-px w-full bg-neutral-800" />

          <div className="grid grid-cols-2 gap-6 text-sm font-mono text-neutral-400">
            <div>
              <span className="block text-neutral-600 text-xs mb-1 uppercase">Date</span>
              {photo.date || "Unknown"}
            </div>
            <div>
              <span className="block text-neutral-600 text-xs mb-1 uppercase">Location</span>
              {photo.location || "Unknown"}
            </div>
          </div>
          
          <div className="text-neutral-400 text-sm leading-relaxed font-light">
            <p>
              Captured in {photo.location}, this piece is part of the {photo.category} collection. 
              It reflects the raw and unfiltered perspective that defines 26phi's work.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
