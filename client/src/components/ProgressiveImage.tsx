import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLazyLoad } from "@/hooks/useLazyLoad";

type ProgressiveImageProps = {
  src: string;
  alt: string;
  className?: string;
  /**
   * Low quality image placeholder (optional)
   * If not provided, will use a blurred version of the main image
   */
  lowResSrc?: string;
  /**
   * Root margin for lazy loading
   * @default "200px"
   */
  rootMargin?: string;
  /**
   * Callback when high-res image is loaded
   */
  onLoad?: () => void;
};

/**
 * Progressive image component with LQIP (Low Quality Image Placeholder) support
 * 
 * Features:
 * - Lazy loading with preloading (loads before entering viewport)
 * - Shows blurred low-res placeholder first
 * - Smoothly transitions to high-res version when loaded
 * - Prevents layout shift with aspect ratio preservation
 * 
 * @example
 * <ProgressiveImage 
 *   src="/high-res.jpg" 
 *   lowResSrc="/low-res.jpg"
 *   alt="Photo"
 *   className="w-full"
 * />
 */
export function ProgressiveImage({
  src,
  alt,
  className,
  lowResSrc,
  rootMargin = "200px",
  onLoad,
}: ProgressiveImageProps) {
  const { ref, isIntersecting } = useLazyLoad({ rootMargin });
  const [isLoaded, setIsLoaded] = useState(false);
  const [highResSrc, setHighResSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!isIntersecting) return;

    // Start loading high-res image
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setHighResSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      // Fallback: still show the image even if loading fails
      setHighResSrc(src);
      setIsLoaded(true);
    };
  }, [isIntersecting, src, onLoad]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {/* Low-res placeholder */}
      {!isLoaded && (
        <img
          src={lowResSrc || src}
          alt={alt}
          className={cn(
            "w-full h-auto transition-opacity duration-300",
            lowResSrc ? "blur-sm scale-105" : "blur-md scale-110"
          )}
          loading="lazy"
        />
      )}
      
      {/* High-res image */}
      {highResSrc && (
        <img
          src={highResSrc}
          alt={alt}
          className={cn(
            "w-full h-auto transition-opacity duration-700",
            isLoaded ? "opacity-100" : "opacity-0",
            !isLoaded && "absolute inset-0"
          )}
        />
      )}
      
      {/* Loading indicator */}
      {isIntersecting && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
