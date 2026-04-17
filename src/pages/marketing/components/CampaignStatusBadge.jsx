import React from 'react';
import { Activity, PauseCircle, FileEdit } from 'lucide-react';

const CampaignStatusBadge = ({ status }) => {
    switch (status) {
        case 'running':
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold capitalize">Running</span>
                </div>
            );
        case 'paused':
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold capitalize">Paused</span>
                </div>
            );
        default:
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    <FileEdit className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold capitalize">Draft</span>
                </div>
            );
    }
};

export default CampaignStatusBadge;
