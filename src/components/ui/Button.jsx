import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import useReducedMotion from '../../hooks/useReducedMotion';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    disabled,
    showArrow = false,
    ...props
}) => {
    const prefersReducedMotion = useReducedMotion();

    const baseStyles = "inline-flex flex-row items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-lg";

    const variants = {
        primary: "text-white focus:ring-blue-500 shadow-lg",
        secondary: "bg-white border text-gray-700 hover:bg-gray-50 focus:ring-blue-200",
        outline: "bg-white border text-gray-700 hover:bg-blue-50 hover:border-blue-400 focus:ring-blue-200",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
        warning: "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-600 shadow-md",
        link: "text-blue-600 underline-offset-4 hover:underline p-0 h-auto"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base"
    };

    const buttonVariants = {
        rest: { scale: 1 },
        hover: {
            y: -2,
            scale: 1.01,
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

    const arrowVariants = {
        rest: { x: 0 },
        hover: {
            x: 3,
            transition: {
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <motion.button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            style={variant === 'primary' ? {
                background: 'linear-gradient(90deg, #1D7CFF 0%, #073B8F 100%)',
                boxShadow: '0px 14px 40px rgba(29, 124, 255, 0.25)'
            } : {}}
            variants={prefersReducedMotion ? {} : buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onMouseEnter={(e) => {
                if (variant === 'primary') {
                    e.currentTarget.style.background = 'linear-gradient(90deg, #2A88FF 0%, #0A4DB4 100%)';
                    e.currentTarget.style.boxShadow = '0px 18px 48px rgba(29, 124, 255, 0.35)';
                } else if (variant === 'outline') {
                    e.currentTarget.style.background = '#3b82f6';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = '#3b82f6';
                }
            }}
            onMouseLeave={(e) => {
                if (variant === 'primary') {
                    e.currentTarget.style.background = 'linear-gradient(90deg, #1D7CFF 0%, #073B8F 100%)';
                    e.currentTarget.style.boxShadow = '0px 14px 40px rgba(29, 124, 255, 0.25)';
                } else if (variant === 'outline') {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.borderColor = '#d1d5db';
                }
            }}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
            {showArrow && (
                <motion.span
                    variants={prefersReducedMotion ? {} : arrowVariants}
                    className="ml-2"
                >
                    <ArrowRight className="w-4 h-4" />
                </motion.span>
            )}
        </motion.button>
    );
};

export default Button;
