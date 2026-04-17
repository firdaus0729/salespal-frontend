import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';

/**
 * IntegrationAlert - Displays integration requirement errors with links to settings
 */
const IntegrationAlert = ({ errors = [], className = '' }) => {
    if (!errors || errors.length === 0) return null;

    return (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-red-800 mb-2">
                        Missing Required Integrations
                    </h4>
                    <ul className="space-y-2">
                        {errors.map((error) => (
                            <li key={error.id} className="flex items-center justify-between gap-4">
                                <span className="text-sm text-red-700">{error.message}</span>
                                <Link
                                    to={`/settings/integrations/${error.id}`}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800 whitespace-nowrap"
                                >
                                    Connect <ArrowRight className="w-3 h-3" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-red-600 mt-3">
                        <Link to="/settings/integrations" className="underline hover:no-underline">
                            Go to Settings → Integrations
                        </Link> to connect required platforms before launching.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IntegrationAlert;
