import React from 'react';
import { motion } from 'framer-motion';
import useScrollReveal from '../../hooks/useScrollReveal';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Scroll reveal component for section headings
 * Applies premium fade-in-up animation with blur effect
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {number} props.delay - Animation delay in seconds
 * @param {string} props.className - Additional CSS classes
 */
export const ScrollRevealHeading = ({
    children,
    delay = 0.05,
    className = ''
}) => {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <div ref={ref} className={className}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
            animate={isVisible ? {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)'
            } : {}}
            transition={{
                duration: 0.7,
                delay,
                ease: [0.25, 0.1, 0.25, 1]
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * Scroll reveal component for section subheadings
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {number} props.delay - Animation delay in seconds
 * @param {string} props.className - Additional CSS classes
 */
export const ScrollRevealSubheading = ({
    children,
    delay = 0.12,
    className = ''
}) => {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <div ref={ref} className={className}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? {
                opacity: 1,
                y: 0
            } : {}}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.25, 0.1, 0.25, 1]
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * General scroll reveal component for any content
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {number} props.delay - Animation delay in seconds
 * @param {number} props.distance - Distance to move up in pixels
 * @param {number} props.duration - Animation duration in seconds
 * @param {string} props.className - Additional CSS classes
 */
export const ScrollReveal = ({
    children,
    delay = 0,
    distance = 20,
    duration = 0.6,
    className = ''
}) => {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <div ref={ref} className={className}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: distance }}
            animate={isVisible ? {
                opacity: 1,
                y: 0
            } : {}}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.1, 0.25, 1]
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * Scroll reveal component with scale animation
 * Used for cards, CTAs, and important elements
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {number} props.delay - Animation delay in seconds
 * @param {string} props.className - Additional CSS classes
 */
export const ScrollRevealScale = ({
    children,
    delay = 0,
    className = ''
}) => {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <div ref={ref} className={className}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isVisible ? {
                opacity: 1,
                scale: 1
            } : {}}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.25, 0.1, 0.25, 1]
            }}
        >
            {children}
        </motion.div>
    );
};
