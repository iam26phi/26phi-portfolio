import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";

type Photo = {
  id: number;
  src: string;
  alt: string;
  displayTitle?: string | null;
  category: string;
  location: string | null;
  date: string | null;
  description: string | null;
  camera?: string | null;
  lens?: string | null;
  settings?: string | null;
  collaboratorName?: string | null;
  collaboratorInstagram?: string | null;
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
}

export default function Lightbox({ photo, onClose, onNext, onPrev, hasNext, hasPrev, nextPhotoSrc, prevPhotoSrc }: LightboxProps) {
  // Zoom State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Swipe Handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [pinchDistance, setPinchDistance] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale === 1) {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale === 1) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || scale > 1) return;
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
      if (e.key === "ArrowRight" && hasNext && scale === 1) onNext();
      if (e.key === "ArrowLeft" && hasPrev && scale === 1) onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev, hasNext, hasPrev, scale]);

  // Reset zoom when photo changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [photo.id]);

  // Zoom Functions
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => {
      const newScale = Math.max(1, Math.min(prev + delta, 3));
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  // Drag Functions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Pinch Zoom
  const getTouchDistance = (touches: React.TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
  };

  const handleTouchStartZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setPinchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMoveZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDistance) {
      const newDistance = getTouchDistance(e.touches);
      const scaleChange = newDistance / pinchDistance;
      setScale(prev => Math.max(1, Math.min(prev * scaleChange, 3)));
      setPinchDistance(newDistance);
    }
  };

  const handleTouchEndZoom = () => {
    setPinchDistance(null);
  };

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
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/50 hover:text-white active:text-white transition-colors z-50 p-2 sm:p-3 touch-manipulation"
      >
        <X size={32} />
      </button>

      {/* Navigation Buttons */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white active:text-white transition-colors z-50 p-2 sm:p-3 touch-manipulation"
        >
          <ChevronLeft size={48} strokeWidth={1} />
        </button>
      )}
      
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white active:text-white transition-colors z-50 p-2 sm:p-3 touch-manipulation"
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
        <div 
          className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStartZoom}
          onTouchMove={handleTouchMoveZoom}
          onTouchEnd={handleTouchEndZoom}
          style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={photo.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-contain shadow-2xl"
              style={{ 
                maxHeight: 'calc(100vh - 2rem)', 
                maxWidth: '100%',
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
              draggable={false}
            />
          </AnimatePresence>
          
          {/* Zoom Controls */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 z-50">
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              className="text-white/70 hover:text-white active:text-white transition-colors p-1 sm:p-1.5 touch-manipulation"
              disabled={scale === 1}
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-white/70 text-xs sm:text-sm font-mono min-w-[2.5rem] sm:min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              className="text-white/70 hover:text-white active:text-white transition-colors p-1 sm:p-1.5 touch-manipulation"
              disabled={scale === 3}
            >
              <ZoomIn size={20} />
            </button>
            {scale > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); handleResetZoom(); }}
                className="text-white/70 hover:text-white active:text-white transition-colors p-1 sm:p-1.5 ml-1 sm:ml-2 touch-manipulation"
              >
                <Maximize2 size={20} />
              </button>
            )}
          </div>
        </div>

        <motion.div
          key={`info-${photo.id}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-full md:w-[240px] lg:w-[280px] flex flex-col gap-3 sm:gap-4 text-white shrink-0"
        >
          <div>
            <p className="text-[10px] sm:text-xs font-mono text-neutral-500 mb-1 sm:mb-2 tracking-widest uppercase">
              {photo.category}
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter leading-none text-white">
              {photo.displayTitle || photo.alt}
            </h2>
          </div>

          <div className="h-px w-full bg-neutral-800" />

          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-mono text-neutral-400">
            {photo.date && (
              <div>
                <span className="block text-neutral-600 text-xs mb-1 uppercase">Date</span>
                {photo.date}
              </div>
            )}
            {photo.location && (
              <div>
                <span className="block text-neutral-600 text-xs mb-1 uppercase">Location</span>
                {photo.location}
              </div>
            )}
            {photo.collaboratorName && (
              <div>
                <span className="block text-neutral-600 text-xs mb-1 uppercase">Collaborator</span>
                <div>{photo.collaboratorName}</div>
                {photo.collaboratorInstagram && (
                  <a
                    href={`https://instagram.com/${photo.collaboratorInstagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    @{photo.collaboratorInstagram.replace('@', '')}
                  </a>
                )}
              </div>
            )}
            {(photo.camera || photo.lens) && (
              <div>
                <span className="block text-neutral-600 text-xs mb-1 uppercase">Gear</span>
                {photo.camera && <div>{photo.camera}</div>}
                {photo.lens && <div className="text-neutral-500">{photo.lens}</div>}
                {photo.settings && <div className="text-neutral-600 text-xs mt-1">{photo.settings}</div>}
              </div>
            )}
          </div>
          
          <div className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-light">
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
