import React from 'react';
import SectionWrapper from '../../../components/layout/SectionWrapper';

const ProjectDetailsForm = ({
    projectName,
    setProjectName,
    industry,
    setIndustry
}) => {
    const industries = [
        { value: 'real-estate', label: 'Real Estate' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'services', label: 'Services' },
        { value: 'enterprise', label: 'Enterprise' },
        { value: 'other', label: 'Other' }
    ];

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    Project Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. LODHA, CoreStreet"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-secondary transition-colors"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    Industry <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-secondary transition-colors"
                    >
                        <option value="" disabled>Select Industry</option>
                        {industries.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-primary text-white">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        ▼
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsForm;
