import React from 'react';
import { ArrowLeft, Pause, Edit2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CampaignHeader() {
    const navigate = useNavigate();

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <button
                        onClick={() => navigate('/marketing/campaigns')}
                        className="flex items-center text-slate-500 hover:text-slate-900 mb-2 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Campaigns
                    </button>

                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-slate-900">Q1 Growth - SaaS</h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Running
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Created Jan 20, 2026</span>
                        <span>•</span>
                        <div className="flex gap-2">
                            <span>Google Ads</span>
                            <span>LinkedIn</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        disabled
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Pause className="w-4 h-4" />
                        Pause
                    </button>
                    <button
                        disabled
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        disabled
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Zap className="w-4 h-4" />
                        Optimize
                    </button>
                </div>
            </div>
        </div>
    );
}
