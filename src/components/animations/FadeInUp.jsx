import React from 'react';
import { motion } from 'framer-motion';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Reusable component for fade-in-up animations
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements to animate
 * @param {number} props.delay - Animation delay in seconds
 * @param {number} props.duration - Animation duration in seconds
 * @param {number} props.distance - Distance to move up in pixels
 * @param {number} props.blur - Initial blur amount in pixels
 */
const FadeInUp = ({
    children,
    delay = 0,
    duration = 0.6,
    distance = 20,
    blur = 0,
    className = ''
}) => {
    const prefersReducedMotion = useReducedMotion();

    // If user prefers reduced motion, show content immediately
    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            initial={{
                opacity: 0,
                y: distance,
                filter: blur > 0 ? `blur(${blur}px)` : 'none'
            }}
            animate={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)'
            }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.1, 0.25, 1] // Custom ease-out curve
            }}
        >
            {children}
        </motion.div>
    );
};

export default FadeInUp;
