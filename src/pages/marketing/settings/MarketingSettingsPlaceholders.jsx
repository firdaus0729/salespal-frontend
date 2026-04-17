import React from 'react';
import NotificationsTab from '../../profile/tabs/NotificationsTab';

export const MarketingSettingsDefaults = () => (
    <div className="space-y-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-gray-900">Campaign Defaults</h1>
        <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
            Default branding and budget settings configuration coming soon.
        </div>
    </div>
);

export const MarketingSettingsTracking = () => (
    <div className="space-y-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-gray-900">Tracking & Attribution</h1>
        <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
            UTM parameters and pixel configuration coming soon.
        </div>
    </div>
);

export const MarketingSettingsNotifications = () => (
    <div className="animate-fade-in-up">
        <NotificationsTab />
    </div>
);
