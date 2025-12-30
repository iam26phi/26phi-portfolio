import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PhotoData = {
  id: number;
  url: string;
  title?: string;
  filename: string;
  category: string;
  location?: string;
  shootDate?: string;
  camera?: string;
  lens?: string;
  settings?: string;
  collaboratorName?: string;
  collaboratorInstagram?: string;
};

type PhotoLightboxProps = {
  photos: PhotoData[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
};

export default function PhotoLightbox({
  photos,
  initialIndex,
  isOpen,
  onClose,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, currentIndex]);

  const goToPrevious = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const goToNext = () => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrevious();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation Buttons */}
      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10"
            onClick={goToNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Photo Counter */}
      <div className="absolute top-4 left-4 z-10 text-white text-sm font-mono">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Main Content */}
      <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
        <div className="w-full h-full max-w-7xl flex flex-col md:flex-row gap-4">
          {/* Image Container */}
          <div
            className="flex-1 flex items-center justify-center relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title || currentPhoto.filename}
              className="max-w-full max-h-full object-contain"
              onLoad={() => setIsLoading(false)}
            />
          </div>

          {/* Photo Info Sidebar */}
          <div className="w-full md:w-80 bg-black/50 backdrop-blur-sm rounded-lg p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-2">
              {currentPhoto.title || currentPhoto.filename}
            </h2>
            <p className="text-sm text-gray-400 mb-6">{currentPhoto.category}</p>

            <div className="space-y-4">
              {/* Location */}
              {currentPhoto.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Location
                    </p>
                    <p className="text-sm text-white">{currentPhoto.location}</p>
                  </div>
                </div>
              )}

              {/* Date */}
              {currentPhoto.shootDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Date
                    </p>
                    <p className="text-sm text-white">
                      {new Date(currentPhoto.shootDate).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Collaborator */}
              {currentPhoto.collaboratorName && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Collaborator
                    </p>
                    <p className="text-sm text-white">{currentPhoto.collaboratorName}</p>
                    {currentPhoto.collaboratorInstagram && (
                      <a
                        href={`https://instagram.com/${currentPhoto.collaboratorInstagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        @{currentPhoto.collaboratorInstagram.replace('@', '')}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Camera Gear */}
              {(currentPhoto.camera || currentPhoto.lens) && (
                <div className="flex items-start gap-3">
                  <Camera className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Gear
                    </p>
                    {currentPhoto.camera && (
                      <p className="text-sm text-white">{currentPhoto.camera}</p>
                    )}
                    {currentPhoto.lens && (
                      <p className="text-sm text-gray-400">{currentPhoto.lens}</p>
                    )}
                    {currentPhoto.settings && (
                      <p className="text-xs text-gray-500 mt-1">{currentPhoto.settings}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard Shortcuts Hint (Desktop) */}
            <div className="hidden md:block mt-8 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Keyboard Shortcuts
              </p>
              <div className="space-y-1 text-xs text-gray-400">
                <p><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">←</kbd> Previous</p>
                <p><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">→</kbd> Next</p>
                <p><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">ESC</kbd> Close</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
