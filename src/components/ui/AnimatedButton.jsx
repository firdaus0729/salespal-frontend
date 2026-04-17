import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Premium animated button with shimmer effect on hover
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - 'primary' or 'secondary'
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 */
const AnimatedButton = ({
    children,
    variant = 'primary',
    onClick,
    className = '',
    ...props
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    const baseClasses = "relative overflow-hidden px-6 py-3 rounded-xl font-semibold";

    const variantClasses = {
        primary: "text-white",
        secondary: "text-gray-900 border-2 border-gray-300 bg-transparent"
    };

    const variantStyles = {
        primary: {
            background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
            boxShadow: '0px 8px 20px rgba(59, 130, 246, 0.3)'
        },
        secondary: {}
    };

    const buttonVariants = {
        rest: { scale: 1 },
        hover: {
            scale: 1.02,
            boxShadow: variant === 'primary'
                ? '0px 12px 28px rgba(59, 130, 246, 0.4)'
                : '0px 6px 16px rgba(0, 0, 0, 0.12)',
            transition: {
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1]
            }
        },
        tap: {
            scale: 0.98,
            transition: { duration: 0.1 }
        }
    };

    const shimmerVariants = {
        rest: { x: '-100%' },
        hover: {
            x: '200%',
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <motion.button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={variantStyles[variant]}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            variants={prefersReducedMotion ? {} : buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            {...props}
        >
            {/* Shimmer effect for primary buttons */}
            {variant === 'primary' && !prefersReducedMotion && (
                <motion.div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                        transform: 'skewX(-15deg)'
                    }}
                    variants={shimmerVariants}
                    initial="rest"
                    animate={isHovered ? "hover" : "rest"}
                />
            )}

            {/* Button content */}
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
        </motion.button>
    );
};

export default AnimatedButton;
