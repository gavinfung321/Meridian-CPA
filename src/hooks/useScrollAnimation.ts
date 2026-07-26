import { useEffect, useRef, useState } from "react";

/**
 * useScrollAnimation
 * Attaches an IntersectionObserver to a DOM element and returns
 * whether it has entered the viewport (once). Pair with CSS classes
 * like .scroll-hidden / .scroll-visible for entrance animations.
 */
export function useScrollAnimation<T extends HTMLElement>(
  threshold = 0.15,
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // fire only once
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}
