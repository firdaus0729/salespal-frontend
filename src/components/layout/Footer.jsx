import React from 'react';
import { Linkedin, Instagram, Facebook, Mail, Phone, MessageCircleQuestion, Send, X } from 'lucide-react';

import { Link } from 'react-router-dom';

// X Brand Icon Component
const XBrandIcon = ({ className = "w-5 h-5", style }) => (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.217-6.817-5.974 6.817H2.882l7.432-8.499L1.24 2.25h6.972l4.728 6.244L17.464 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
);


const Footer = () => {
    return (
        <>
            <footer id="contact" className="py-16 px-6 relative" style={{
                background: '#122332',
                borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
                <div className="max-w-7xl mx-auto">
                    {/* Main footer content */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        {/* Left section - Logo and tagline */}
                        <div className="lg:col-span-1">
                            <Link to="/" className="flex items-center mb-4 -ml-5">
                                <img
                                    src="/SalesPal Logo Footer.jpeg"
                                    alt="SalesPal Logo"
                                    className="h-14 object-contain"
                                />
                            </Link>
                            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                The World's First AI Workforce for Revenue Automation. Replace manual marketing, sales & support with human-like AI.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full transition-all" style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }} onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(46,139,255,0.18)';
                                    e.currentTarget.style.border = '1px solid rgba(46,139,255,0.30)';
                                }} onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                                }}>
                                    <Instagram className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.80)' }} />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full transition-all" style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }} onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(46,139,255,0.18)';
                                    e.currentTarget.style.border = '1px solid rgba(46,139,255,0.30)';
                                }} onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                                }}>
                                    <Facebook className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.80)' }} />
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full transition-all" style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }} onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(46,139,255,0.18)';
                                    e.currentTarget.style.border = '1px solid rgba(46,139,255,0.30)';
                                }} onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                                }}>
                                    <Linkedin className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.80)' }} />
                                </a>
                                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full transition-all" style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }} onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(46,139,255,0.18)';
                                    e.currentTarget.style.border = '1px solid rgba(46,139,255,0.30)';
                                }} onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                                }}>
                                    <XBrandIcon className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.80)' }} />
                                </a>
                            </div>
                        </div>

                        {/* Products column */}
                        <div>
                            <h3 className="font-semibold mb-4 uppercase text-sm" style={{ color: 'rgba(255,255,255,0.90)', letterSpacing: '0.04em' }}>Products</h3>
                            <ul className="space-y-3">
                                <li><Link to="/products/salespal-360" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.70)' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2E8BFF'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.70)'}>SalesPal 360</Link></li>
                                <li><Link to="/products/marketing" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.70)' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2E8BFF'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.70)'}>SalesPal Marketing</Link></li>
                                <li><Link to="/products/sales" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.70)' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2E8BFF'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.70)'}>SalesPal Sales</Link></li>
                                <li><Link to="/products/post-sale" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.70)' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2E8BFF'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.70)'}>SalesPal Post Sales</Link></li>
                                <li><Link to="/products/support" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.70)' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2E8BFF'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.70)'}>SalesPal Support</Link></li>
                            </ul>
                        </div>

                        {/* Company column */}
                        <div>
                            <h3 className="font-semibold mb-4 uppercase text-sm" style={{ color: 'rgba(255,255,255,0.90)', letterSpacing: '0.04em' }}>Company</h3>
                            <ul className="space-y-3">
                                <li><a href="https://mounttsense.com" target="_blank" rel="noopener noreferrer" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.70)' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2E8BFF'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.70)'}>About Us</a></li>
                                <li><Link to="/contact" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.70)' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2E8BFF'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.70)'}>Contact</Link></li>
                                <li><a href="/#pricing" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.70)' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2E8BFF'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.70)'}>Pricing</a></li>
                            </ul>
                        </div>

                        {/* Contact Us column */}
                        <div>
                            <h3 className="font-semibold mb-4 uppercase text-sm" style={{ color: 'rgba(255,255,255,0.90)', letterSpacing: '0.04em' }}>Contact Us</h3>
                            <ul className="space-y-3">
                                <li>
                                    <a href="mailto:care@salespal.in" className="text-sm flex items-center gap-2 transition-colors" style={{ color: 'rgba(255,255,255,0.70)' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2E8BFF'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.70)'}>
                                        <Mail className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.55)' }} />
                                        care@salespal.in
                                    </a>
                                </li>
                                <li>
                                    <a href="tel:+918065253600" className="text-sm flex items-center gap-2 transition-colors" style={{ color: 'rgba(255,255,255,0.70)' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2E8BFF'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.70)'}>
                                        <Phone className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.55)' }} />
                                        +91 8065253600
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                            © {new Date().getFullYear()} SalesPal. All rights reserved.
                        </div>
                        <div className="flex gap-6 text-sm">
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.60)' }}>Privacy Policy</span>
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.60)' }}>Terms of Service</span>
                        </div>
                    </div>
                </div>

                {/* Ask AI Floating Button */}
                <AskAIButton />
            </footer>
        </>
    );
};

const AskAIButton = () => {
    const [showLabel, setShowLabel] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');

    React.useEffect(() => {
        // Initial show after 1 second
        const initialTimer = setTimeout(() => setShowLabel(true), 1000);

        // Hide after it's been shown for 3 seconds
        const hideTimer = setTimeout(() => setShowLabel(false), 4000);

        // Then toggle every 5 seconds (cycle: 2s invisible, 3s visible)
        // Only toggle if chat is NOT open
        const interval = setInterval(() => {
            if (!isOpen) {
                setShowLabel(true);
                setTimeout(() => setShowLabel(false), 3000);
            }
        }, 5000);

        return () => {
            clearTimeout(initialTimer);
            clearTimeout(hideTimer);
            clearInterval(interval);
        };
    }, [isOpen]);

    // Force hide label when open
    React.useEffect(() => {
        if (isOpen) setShowLabel(false);
    }, [isOpen]);

    const isInputValid = inputValue.trim().length > 0;

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">

            {/* Chat Popup Window */}
            {isOpen && (
                <div className="mb-2 bg-white rounded-2xl shadow-2xl w-[350px] overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                        <h3 className="font-bold text-gray-900 text-base">Ask SalesPal AI</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4">
                        <p className="text-gray-500 text-sm mb-4">
                            Have questions about SalesPal? Ask our AI assistant!
                        </p>

                        <div className="relative">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="E.g., What is the pricing for SalesPal 360?"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none h-24 mb-3"
                            />
                        </div>

                        <button
                            disabled={!isInputValid}
                            className={`w-full font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm
                                ${isInputValid
                                    ? 'bg-[#0066FF] hover:bg-blue-700 text-white cursor-pointer'
                                    : 'bg-[#8EA7E9] text-white/80 cursor-not-allowed'
                                }`}
                        >
                            <Send className="w-4 h-4" />
                            Ask AI
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3">
                {/* Text Label - Pops up periodically (Hidden when open) */}
                <div className={`
                    bg-[#E2E8F0] text-[#0066FF] px-4 py-2 rounded-2xl font-semibold text-sm shadow-lg
                    transition-all duration-500 transform origin-right
                    ${!isOpen && showLabel ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 translate-x-4 pointer-events-none'}
                `}>
                    Ask AI
                </div>

                {/* Circular Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-[3px] border-white transition-all duration-300 group ${isOpen ? 'bg-[#0066FF] rotate-90' : 'bg-[#0066FF] hover:bg-blue-700'}`}
                >
                    {isOpen ? (
                        <X className="w-7 h-7 text-white" strokeWidth={2.5} />
                    ) : (
                        <MessageCircleQuestion className="w-7 h-7 text-white" strokeWidth={2.5} />
                    )}
                </button>
            </div>
        </div>
    );
};


export default Footer;
