import React from 'react';
import ModulePage from '../ModulePage';
import { BarChart3 } from 'lucide-react';

const Sales = () => {
    return (
        <ModulePage
            title="Sales Acceleration"
            description="AI calling, WhatsApp follow-ups, and lead conversion."
            icon={BarChart3}
        />
    );
};

export default Sales;
