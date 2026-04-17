import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({ trigger, children, align = 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={`absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}`}
                >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {React.Children.map(children, (child) => {
                            if (React.isValidElement(child)) {
                                return React.cloneElement(child, {
                                    onClick: (e) => {
                                        child.props.onClick?.(e);
                                        setIsOpen(false);
                                    }
                                });
                            }
                            return child;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const DropdownItem = ({ children, onClick, className = '', variant = 'default' }) => {
    const baseStyles = "block w-full text-left px-4 py-2 text-sm transition-colors";
    const variants = {
        default: "text-gray-700 hover:bg-gray-100",
        danger: "text-red-600 hover:bg-red-50",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            role="menuitem"
            onClick={onClick}
        >
            {children}
        </button>
    );
};

Dropdown.Item = DropdownItem;

export default Dropdown;
