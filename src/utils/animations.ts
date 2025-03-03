
import { useEffect, useState } from "react";

// Staggered children animation
export const useStaggeredChildren = (
  childCount: number,
  baseDelay = 100,
  staggerDelay = 50
) => {
  return Array.from({ length: childCount }).map(
    (_, i) => `animate-slide-in-bottom` + ` [animation-delay:${baseDelay + i * staggerDelay}ms]`
  );
};

// Fade in when element enters viewport
export const useFadeInOnScroll = (ref: React.RefObject<HTMLElement>) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, stop observing
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref]);

  return isVisible ? "animate-fade-in" : "opacity-0";
};

// Button press animation
export const buttonPressAnimation = "active:scale-95 transition-transform duration-100";

// Card hover animation
export const cardHoverAnimation = "transition-all duration-300 hover:shadow-medium hover:-translate-y-1";

// Smooth transitions
export const smoothTransition = "transition-all duration-300 ease-in-out";

// Progress bar animation with percentage
export const getProgressAnimation = (percentage: number) => {
  return `animate-progress-fill [--progress-value:${percentage}%]`;
};
