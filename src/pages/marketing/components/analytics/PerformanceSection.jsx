import React from 'react';
import { Facebook, Chrome, Search } from 'lucide-react';
import CampaignStatusBadge from '../CampaignStatusBadge';
import { usePreferences } from '../../../../context/PreferencesContext';

const PerformanceSection = () => {
    const { formatCurrency } = usePreferences();
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Campaign Performance</h3>
                <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary w-64"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Campaign Name</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Platforms</th>
                            <th className="px-6 py-3 text-right">Spend (Today)</th>
                            <th className="px-6 py-3 text-right">Leads (Today)</th>
                            <th className="px-6 py-3 text-right">CTR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">AI Lead Generation Campaign</td>
                            <td className="px-6 py-4"><CampaignStatusBadge status="running" /></td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Facebook className="w-4 h-4 text-[#1877F2]" />
                                    <Chrome className="w-4 h-4 text-[#EA4335]" />
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">{formatCurrency(3450)}</td>
                            <td className="px-6 py-4 text-right font-semibold text-green-600">8</td>
                            <td className="px-6 py-4 text-right text-gray-600">2.1%</td>
                        </tr>
                        {/* Mock Draft Campaign */}
                        <tr className="hover:bg-gray-50/50 transition-colors opacity-60">
                            <td className="px-6 py-4 font-medium text-gray-900">Brand Awareness Q1</td>
                            <td className="px-6 py-4"><CampaignStatusBadge status="draft" /></td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Facebook className="w-4 h-4" />
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">—</td>
                            <td className="px-6 py-4 text-right">—</td>
                            <td className="px-6 py-4 text-right">—</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PerformanceSection;
