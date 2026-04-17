import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMarketing } from '../../../context/MarketingContext';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

export default function CreateProject() {
    const navigate = useNavigate();
    const { createProject } = useMarketing();
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        customIndustry: '',
        website: ''
    });
    const [urlError, setUrlError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        let processedWebsite = formData.website.trim();
        if (!processedWebsite) return;

        // Basic domain validation
        const urlPattern = /^(https?:\/\/)?(localhost|[\w.-]+\.[a-zA-Z]{2,})(:[0-9]{1,5})?(\/.*)?$/;
        if (!urlPattern.test(processedWebsite)) {
            setUrlError('Please enter a valid URL (e.g., example.com)');
            return;
        }

        setUrlError('');

        if (!processedWebsite.startsWith('http://') && !processedWebsite.startsWith('https://')) {
            processedWebsite = `https://${processedWebsite}`;
        }

        if (!formData.name) return;
        if (formData.industry === 'Other' && !formData.customIndustry.trim()) return;

        const finalIndustry = formData.industry === 'Other' ? formData.customIndustry.trim() : formData.industry;

        const dataToSubmit = {
            ...formData,
            industry: finalIndustry,
            website: processedWebsite
        };
        delete dataToSubmit.customIndustry;

        setIsSubmitting(true);
        try {
            const newProject = await createProject(dataToSubmit);
            navigate(`/marketing/projects/${newProject.id}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <button
                onClick={() => navigate('/marketing/projects')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Projects
            </button>

            <Card className="p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Project Name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Q1 Marketing Drive"
                        required
                    />

                    <Select
                        label="Industry"
                        value={formData.industry}
                        onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                        required
                    >
                        <option value="">Select industry</option>
                        <option value="SaaS">SaaS</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                    </Select>

                    {formData.industry === 'Other' && (
                        <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                            <Input
                                type="text"
                                label="Enter Industry"
                                value={formData.customIndustry}
                                onChange={(e) => setFormData(prev => ({ ...prev, customIndustry: e.target.value }))}
                                placeholder="Custom Industry"
                                required={formData.industry === 'Other'}
                            />
                        </div>
                    )}

                    <Input
                        type="text"
                        label="Website URL"
                        value={formData.website}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, website: e.target.value }));
                            if (urlError) setUrlError('');
                        }}
                        placeholder="e.g. example.com or https://example.com"
                        required
                        error={urlError}
                    />

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/marketing/projects')}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Project'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
