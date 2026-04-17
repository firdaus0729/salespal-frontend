import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const MarketingSettingsOverview = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings Overview</h1>
                <p className="text-gray-500 mt-1">Status of your marketing configuration and connections.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-600" /> System Status
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Meta Ads</span>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Connected
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Google Ads</span>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                Not Connected
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <Button variant="secondary" className="w-full justify-between group" onClick={() => navigate('integrations')}>
                            Manage Integrations <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </Button>
                        <Button variant="secondary" className="w-full justify-between group" onClick={() => navigate('defaults')}>
                            Configure Defaults <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MarketingSettingsOverview;
