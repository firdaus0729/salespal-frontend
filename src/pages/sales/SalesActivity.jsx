import React, { useState, useEffect } from 'react';
import { ShieldAlert, Phone, MessageSquare, Clock, Activity, Loader2 } from 'lucide-react';
import api from '../../lib/api';

const SalesActivity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const data = await api.get('/sales/activities');
                setActivities(data || []);
            } catch (err) {
                console.error("Failed to fetch deal activities", err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, []);

    const getActivityIcon = (type) => {
        switch (type) {
            case 'call': return <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Phone size={18} /></div>;
            case 'whatsapp': return <div className="p-2 bg-green-100 text-green-600 rounded-lg"><MessageSquare size={18} /></div>;
            case 'alert': return <div className="p-2 bg-red-100 text-red-600 rounded-lg"><ShieldAlert size={18} /></div>;
            default: return <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Clock size={18} /></div>;
        }
    };

    return (
        <div className="font-sans text-gray-900 pb-12">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-4 border-b border-gray-100 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Sales Activity
                    </h1>
                    <p className="text-gray-500 mt-1">Review all recent AI interactions and automated followups</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-gray-500" /> Activity Feed
                </h2>
                
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                ) : activities.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">No recent activities found for your deals.</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {activities.map(act => (
                            <div key={act.id} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                {getActivityIcon(act.activity_type || 'note')}
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{act.activity_type || 'Activity'} - {act.deal_title || 'Deal'}</p>
                                    <p className="text-xs text-gray-500 mt-1">{act.description}</p>
                                    <span className="text-[10px] text-gray-400 mt-2 block">
                                        {act.created_at ? new Date(act.created_at).toLocaleString() : 'Just now'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesActivity;
