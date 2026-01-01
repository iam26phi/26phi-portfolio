import { useEffect, useRef } from 'react';

/**
 * Custom hook for animating text with anime.js
 * Applies floating animation and hover color effects to text elements
 */
export function useTextAnimation(selector: string = 'p') {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    // Dynamically import anime.js from CDN
    const initAnimation = async () => {
      try {
        const { animate, utils, stagger, splitText } = await import(
          // @ts-ignore - Dynamic CDN import
          'https://esm.sh/animejs@4'
        );

        if (!mounted) return;

        const colors: string[] = [];

        const split = splitText(selector, {
          lines: true,
        });

        // Add floating animation to lines
        split.addEffect(({ lines }: any) =>
          animate(lines, {
            y: ['50%', '-50%'],
            loop: true,
            alternate: true,
            delay: stagger(400),
            ease: 'inOutQuad',
          })
        );

        // Add hover color change effect to words
        split.addEffect((splitInstance: any) => {
          splitInstance.words.forEach(($el: any, i: number) => {
            const color = colors[i];
            if (color) utils.set($el, { color });

            $el.addEventListener('pointerenter', () => {
              animate($el, {
                color: utils.randomPick([
                  '#FF4B4B',
                  '#FFCC2A',
                  '#B7FF54',
                  '#57F695',
                ]),
                duration: 250,
              });
            });
          });

          // Return cleanup function
          return () => {
            splitInstance.words.forEach((w: any, i: number) => {
              colors[i] = utils.get(w, 'color') as string;
            });
          };
        });

        // Store cleanup function
        cleanupRef.current = () => {
          // Cleanup animation if needed
          if (split && typeof split.revert === 'function') {
            split.revert();
          }
        };
      } catch (error) {
        console.error('Failed to load anime.js:', error);
      }
    };

    initAnimation();

    return () => {
      mounted = false;
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [selector]);
}
