import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook for scroll-triggered reveal animations
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Intersection threshold (0-1)
 * @param {boolean} options.once - Trigger animation only once
 * @param {number} options.rootMargin - Root margin for intersection observer
 * @returns {Object} - { ref, isVisible }
 */
const useScrollReveal = (options = {}) => {
    const {
        threshold = 0.1,
        once = true,
        rootMargin = '0px'
    } = options;

    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);

                    // If once is true, disconnect after first trigger
                    if (once) {
                        observer.unobserve(element);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            {
                threshold,
                rootMargin
            }
        );

        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, once, rootMargin]);

    return { ref, isVisible };
};

export default useScrollReveal;
