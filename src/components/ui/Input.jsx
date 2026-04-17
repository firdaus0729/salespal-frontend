import React from 'react';

const Input = React.forwardRef(({ className = '', label, error, helperText, required, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                className={`flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : ''} ${className}`}
                ref={ref}
                required={required}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
    );
});

Input.displayName = "Input";

export default Input;
