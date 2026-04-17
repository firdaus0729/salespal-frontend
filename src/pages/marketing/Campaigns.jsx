import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import CampaignListPlaceholder from './components/CampaignListPlaceholder';
import CampaignCard from './components/CampaignCard';
import RunningCampaignNotice from './components/RunningCampaignNotice';

import { useMarketing } from '../../context/MarketingContext';
import { calculateROAS, calculateCPL } from '../../utils/analyticsCalculations';

const Campaigns = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { campaigns } = useMarketing();

    const handleCreateCampaign = () => {
        navigate('/marketing/projects'); // Always route to projects hub to pick a project 
    };

    // Filter and Sort Logic
    const sortedCampaigns = useMemo(() => {
        let processed = [...campaigns];

        const sort = searchParams.get('sort');
        const order = searchParams.get('order') || 'asc';
        const filter = searchParams.get('filter');

        // 1. Filter
        if (filter === 'revenue_gt_0') {
            processed = processed.filter(c => (Number(c.revenue) || 0) > 0);
        }

        // 2. Sort
        if (sort) {
            processed.sort((a, b) => {
                let valA = 0;
                let valB = 0;

                const getMetric = (c, metric) => {
                    const rev = Number(c.revenue) || 0;
                    const spd = Number(c.spend) || 0;
                    const conv = Number(c.conversions) || 0;

                    switch (metric) {
                        case 'roas': return calculateROAS(rev, spd);
                        case 'cpa': return calculateCPL(spd, conv);
                        case 'revenue': return rev;
                        case 'spend': return spd;
                        default: return 0;
                    }
                };

                valA = getMetric(a, sort);
                valB = getMetric(b, sort);

                return order === 'desc' ? valB - valA : valA - valB;
            });
        }

        return processed;
    }, [campaigns, searchParams]);

    const highlightMode = searchParams.get('highlight');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
                <button
                    onClick={handleCreateCampaign}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Campaign
                </button>
            </div>

            {sortedCampaigns.length > 0 ? (
                <div className="space-y-6">
                    <RunningCampaignNotice />
                    {sortedCampaigns.map((campaign, index) => {
                        // Highlighting Logic (Visual cues without changing Card component)
                        let highlightClass = '';
                        if (highlightMode === 'performance' && sortedCampaigns.length > 1) {
                            if (index === 0) highlightClass = 'ring-2 ring-green-500 rounded-xl relative after:content-["Top_Performer"] after:absolute after:-top-3 after:left-4 after:bg-green-500 after:text-white after:text-xs after:px-2 after:py-0.5 after:rounded-full';
                            if (index === sortedCampaigns.length - 1) highlightClass = 'ring-2 ring-red-300 rounded-xl relative after:content-["Needs_Attention"] after:absolute after:-top-3 after:left-4 after:bg-red-400 after:text-white after:text-xs after:px-2 after:py-0.5 after:rounded-full';
                        }
                        if (highlightMode === 'inefficient' && index === 0 && (Number(campaign.spend) || 0) > 100) {
                            highlightClass = 'ring-2 ring-red-500 rounded-xl relative after:content-["Highest_CPA"] after:absolute after:-top-3 after:left-4 after:bg-red-500 after:text-white after:text-xs after:px-2 after:py-0.5 after:rounded-full';
                        }

                        return (
                            <div key={campaign.id} className={highlightClass}>
                                <CampaignCard campaign={campaign} />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
                    <CampaignListPlaceholder onCreate={handleCreateCampaign} />
                </div>
            )}
        </div>
    );
};

export default Campaigns;
