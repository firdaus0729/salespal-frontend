import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ArrowRight, Zap } from 'lucide-react';
import Button from '../../../components/ui/Button';

const EmptyCampaignState = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto px-6">
            <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-xl">
                    <Megaphone className="w-10 h-10 text-primary" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center border-2 border-white animate-bounce-slow">
                        <Zap className="w-4 h-4 text-primary fill-current" />
                    </div>
                </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Create your first AI Marketing Campaign
            </h2>

            <p className="text-gray-500 text-lg mb-10 leading-relaxed">
                SalesPal analyzes your business, creates ads, selects platforms,
                and optimizes performance automatically.
            </p>

            <Link to="/marketing/projects">
                <Button variant="primary" icon={ArrowRight} className="h-12 px-8 text-base shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all">
                    Create New Campaign
                </Button>
            </Link>

            <p className="mt-6 text-sm text-gray-400 font-medium">
                Free trial • No credit card required
            </p>
        </div>
    );
};

export default EmptyCampaignState;
