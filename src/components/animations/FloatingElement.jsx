import React from 'react';
import { motion } from 'framer-motion';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Wrapper component for subtle floating animation
 * Creates a very slow, barely noticeable floating effect
 * @param {Object} props
 * @param {React.ReactNode} props.children - Element to float
 * @param {number} props.distance - Float distance in pixels (default: 6)
 * @param {number} props.duration - Animation duration in seconds (default: 5)
 */
const FloatingElement = ({
    children,
    distance = 6,
    duration = 5,
    className = ''
}) => {
    const prefersReducedMotion = useReducedMotion();

    // If user prefers reduced motion, don't animate
    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            animate={{
                y: [-distance, 0, -distance]
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'easeInOut'
            }}
        >
            {children}
        </motion.div>
    );
};

export default FloatingElement;
