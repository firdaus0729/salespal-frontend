import React from 'react';
import Card from '../../../components/ui/Card';
import { BarChart2, TrendingUp, Users, Eye } from 'lucide-react';

const SocialAnalytics = () => {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
                        <Users className="w-4 h-4" /> Total Followers
                    </div>
                    <div className="text-2xl font-bold text-gray-900">12.5k</div>
                    <div className="text-xs text-green-600 mt-1 font-medium">+120 this week</div>
                </Card>
                <Card>
                    <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
                        <Eye className="w-4 h-4" /> Post Impressions
                    </div>
                    <div className="text-2xl font-bold text-gray-900">45.2k</div>
                    <div className="text-xs text-green-600 mt-1 font-medium">+5.4% vs last week</div>
                </Card>
                <Card>
                    <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" /> Engagement Rate
                    </div>
                    <div className="text-2xl font-bold text-gray-900">3.8%</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">Average across platforms</div>
                </Card>
            </div>

            <Card className="p-8 text-center bg-gray-50 border-dashed">
                <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Detailed Report Available Soon</h3>
                <p className="text-gray-500">We are gathering more data to show you deeper insights.</p>
            </Card>
        </div>
    );
};

export default SocialAnalytics;
