import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Megaphone, Link as LinkIcon, ArrowRight } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { useIntegrations } from '../../../context/IntegrationContext';

const MarketingSettings = () => {
    const navigate = useNavigate();
    const { integrations } = useIntegrations();

    const integrationList = [
        {
            id: 'meta',
            name: 'Meta Ads',
            description: 'Connect Facebook & Instagram ad accounts.',
            icon: Facebook,
            path: '/settings/integrations/meta'
        },
        {
            id: 'google',
            name: 'Google Ads',
            description: 'Sync campaigns from Google Ads.',
            icon: ({ className }) => <span className={`flex items-center justify-center font-bold text-lg text-blue-600 ${className}`}>G</span>,
            path: '/settings/integrations/google'
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Marketing Settings</h1>
                <p className="text-gray-500 mt-1">Manage integrations and defaults for your marketing campaigns.</p>
            </div>

            <div className="grid gap-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-gray-400" /> Integrations
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {integrationList.map(item => {
                            const status = integrations[item.id];
                            const isConnected = status?.connected;

                            return (
                                <Card
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    className="p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                                        <item.icon className="w-6 h-6 text-gray-700 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                            {isConnected && <Badge variant="success" className="text-[10px] h-5 px-1.5">Connected</Badge>}
                                        </div>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                                </Card>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-gray-400" /> Campaign Defaults
                    </h2>
                    <Card className="p-6 text-center text-gray-500 text-sm bg-gray-50/50 border-dashed">
                        Configure default branding and tracking parameters coming soon.
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MarketingSettings;
