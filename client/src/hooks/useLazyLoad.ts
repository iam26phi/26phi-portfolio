import { useEffect, useRef, useState } from "react";

type UseLazyLoadOptions = {
  /**
   * Root margin for Intersection Observer
   * Positive values will trigger loading before element enters viewport
   * @default "200px"
   */
  rootMargin?: string;
  /**
   * Threshold for Intersection Observer
   * @default 0.01
   */
  threshold?: number;
};

/**
 * Advanced lazy loading hook with preloading support
 * Uses Intersection Observer to detect when element is about to enter viewport
 * 
 * @example
 * const { ref, isIntersecting } = useLazyLoad({ rootMargin: "200px" });
 * return <img ref={ref} src={isIntersecting ? highResSrc : lowResSrc} />;
 */
export function useLazyLoad(options: UseLazyLoadOptions = {}) {
  const { rootMargin = "200px", threshold = 0.01 } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Create Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            // Once loaded, stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  return { ref, isIntersecting };
}
