import { useEffect, useState } from 'react';

/**
 * Custom hook to detect if user prefers reduced motion
 * Returns true if user has enabled reduced motion in their OS settings
 */
const useReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        // Check if window is defined (SSR safety)
        if (typeof window === 'undefined') return;

        // Create media query
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Set initial value
        setPrefersReducedMotion(mediaQuery.matches);

        // Listen for changes
        const handleChange = (event) => {
            setPrefersReducedMotion(event.matches);
        };

        // Add listener
        mediaQuery.addEventListener('change', handleChange);

        // Cleanup
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return prefersReducedMotion;
};

export default useReducedMotion;
