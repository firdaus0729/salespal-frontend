import React from 'react';
import { Pencil } from 'lucide-react';

const ReviewSection = ({ title, onEdit, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <button
                onClick={onEdit}
                className="p-1.5 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                title="Edit this section"
            >
                <Pencil className="w-4 h-4" />
            </button>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

export default ReviewSection;
