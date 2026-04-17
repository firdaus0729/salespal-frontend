import React from 'react';
import { motion } from 'framer-motion';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Container that staggers animations of child elements
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements to animate
 * @param {number} props.staggerDelay - Delay between each child animation
 * @param {number} props.initialDelay - Initial delay before first child
 */
const StaggerContainer = ({
    children,
    staggerDelay = 0.08,
    initialDelay = 0,
    className = ''
}) => {
    const prefersReducedMotion = useReducedMotion();

    // If user prefers reduced motion, show content immediately
    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: initialDelay,
                staggerChildren: staggerDelay
            }
        }
    };

    return (
        <motion.div
            className={className}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {children}
        </motion.div>
    );
};

/**
 * Individual stagger item component
 */
export const StaggerItem = ({
    children,
    className = '',
    distance = 18,
    scale = 0.985
}) => {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: distance,
            scale: scale
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.65,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    return (
        <motion.div
            className={className}
            variants={itemVariants}
        >
            {children}
        </motion.div>
    );
};

export default StaggerContainer;
