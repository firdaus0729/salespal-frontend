import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

const VARIANTS = {
    success: {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        bg: 'bg-white',
        border: 'border-emerald-100',
        title: 'text-gray-900',
    },
    error: {
        icon: <XCircle className="w-5 h-5 text-rose-500" />,
        bg: 'bg-white',
        border: 'border-rose-100',
        title: 'text-gray-900',
    },
    warning: {
        icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
        bg: 'bg-white',
        border: 'border-amber-100',
        title: 'text-gray-900',
    },
    info: {
        icon: <Info className="w-5 h-5 text-sky-500" />,
        bg: 'bg-white',
        border: 'border-sky-100',
        title: 'text-gray-900',
    }
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(({ title, description, variant = 'success', duration = 3000 }) => {
        const id = ++idCounter;

        setToasts((current) => [
            ...current,
            {
                id,
                title,
                description,
                variant,
                duration
            }
        ]);

        return id;
    }, []);

    useEffect(() => {
        if (toasts.length === 0) return;

        const timers = toasts.map((toast) =>
            setTimeout(() => {
                removeToast(toast.id);
            }, toast.duration || 3000)
        );

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [toasts, removeToast]);

    const value = { showToast, removeToast };

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* Toast viewport */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-full max-w-sm px-4 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => {
                        const style = VARIANTS[toast.variant] || VARIANTS.info;
                        return (
                            <motion.div
                                key={toast.id}
                                layout
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className={`pointer-events-auto bg-white/95 backdrop-blur-md border ${style.border} rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-4 py-3.5 flex items-start gap-3.5`}
                            >
                                <div className="shrink-0 mt-0.5">
                                    {style.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    {toast.title && (
                                        <p className={`text-sm font-bold ${style.title}`}>
                                            {toast.title}
                                        </p>
                                    )}
                                    {toast.description && (
                                        <p className="mt-0.5 text-xs text-gray-500 leading-relaxed font-medium">
                                            {toast.description}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeToast(toast.id)}
                                    className="shrink-0 ml-1 p-1 hover:bg-gray-50 rounded-lg transition-colors text-gray-300 hover:text-gray-500"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return ctx;
};

