import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { usePreferences } from '../../../context/PreferencesContext';

const PricingCard = ({
    title,
    price,
    features,
    ctaText,
    isPopular = false,
    isMint = false
}) => {
    const { formatCurrency } = usePreferences();
    return (
        <div className={`relative p-8 rounded-2xl border transition-all duration-300 flex flex-col h-full ${isPopular
            ? 'bg-white/5 border-secondary shadow-[0_0_40px_rgba(118,247,197,0.1)] transform md:-translate-y-4'
            : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Most Popular
                </div>
            )}

            <div className="mb-8 text-center">
                <h3 className={`text-xl font-bold mb-4 ${isMint ? 'text-secondary' : 'text-white'}`}>
                    {title}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">{formatCurrency(price)}</span>
                    <span className="text-sm text-[#A8B3BD]">/ month</span>
                </div>
                <p className="text-[10px] text-[#7C8A96] mt-2 font-medium">(Exclusive of GST & convenience fee)</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#A8B3BD] text-sm">
                        <Check className={`w-5 h-5 shrink-0 ${isMint || isPopular ? 'text-secondary' : 'text-[#7C8A96]'}`} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <Link to="/projects" className="w-full">
                <button className={`w-full py-3 rounded-lg font-semibold transition-all ${isPopular
                    ? 'bg-secondary text-primary hover:bg-secondary/90'
                    : 'bg-white/10 text-white hover:bg-white/20'
                    }`}>
                    {ctaText}
                </button>
            </Link>
        </div>
    );
};

export default PricingCard;
