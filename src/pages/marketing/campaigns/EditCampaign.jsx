import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMarketing } from '../../../context/MarketingContext';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { getCampaignRoute } from '../../../utils/navigationUtils';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Card from '../../../components/ui/Card';

export default function EditCampaign() {
    const { projectId, campaignId } = useParams();
    const navigate = useNavigate();
    const { getCampaignById, updateCampaign } = useMarketing();

    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        dailyBudget: '',
        status: 'active',
        platforms: []
    });

    useEffect(() => {
        const campaign = getCampaignById(campaignId);
        if (campaign) {
            setFormData({
                name: campaign.name,
                dailyBudget: campaign.dailyBudget, // raw number or string
                status: campaign.status,
                platforms: campaign.platforms || []
            });
        }
        setIsLoading(false);
    }, [campaignId, getCampaignById]);

    const handleSubmit = (e) => {
        e.preventDefault();
        updateCampaign(campaignId, formData);
        // Navigate back to details
        navigate(getCampaignRoute(projectId, campaignId));
    };

    const togglePlatform = (platform) => {
        setFormData(prev => {
            const platforms = prev.platforms.includes(platform)
                ? prev.platforms.filter(p => p !== platform)
                : [...prev.platforms, platform];
            return { ...prev, platforms };
        });
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading campaign settings...</div>;

    return (
        <div className="animate-fade-in-up max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate(getCampaignRoute(projectId, campaignId))}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Campaign
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Edit Campaign Settings</h1>
                <p className="text-gray-500 mt-1">Update your campaign configuration without losing history.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <div className="space-y-4">
                        <Input
                            label="Campaign Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Daily Budget"
                                value={formData.dailyBudget}
                                onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
                                placeholder="e.g. 3500"
                                required
                            />
                            <Select
                                label="Status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active (Running)</option>
                                <option value="paused">Paused</option>
                                <option value="draft">Draft</option>
                                <option value="ended">Ended</option>
                            </Select>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="font-semibold text-gray-900 mb-4">Target Platforms</h3>
                    <div className="space-y-3">
                        {['Meta Ads (Facebook & Instagram)', 'Google Search Ads', 'LinkedIn Ads'].map(p => {
                            const isSelected = formData.platforms.some(sel => p.includes(sel) || (p.includes('Meta') && sel === 'Facebook'));
                            // Simplified matching logic for this mock
                            const code = p.includes('Meta') ? 'Facebook' : p.includes('Google') ? 'Google' : 'LinkedIn';
                            const checked = formData.platforms.includes(code) || (code === 'Facebook' && formData.platforms.some(x => x.includes('Meta')));

                            return (
                                <label key={code} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => togglePlatform(code)}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-gray-700 font-medium">{p}</span>
                                </label>
                            );
                        })}
                    </div>
                </Card>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-900">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>
                        <strong>Note:</strong> Editing ad creatives and copy is currently restricted to ensure AI optimization consistency.
                        Changing budget or platforms will take effect immediately.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate(getCampaignRoute(projectId, campaignId))}
                    >
                        Cancel
                    </Button>
                    <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
