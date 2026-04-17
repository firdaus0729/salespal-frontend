import React from 'react';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title, description }) => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Construction className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-500 max-w-md">
                {description || "This feature is currently under development. Check back soon!"}
            </p>
        </div>
    );
};

export default PlaceholderPage;
