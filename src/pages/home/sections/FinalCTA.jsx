import React from 'react';
import { Link } from 'react-router-dom';
import SectionWrapper from '../../../components/layout/SectionWrapper';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const FinalCTA = () => {
    const prefersReducedMotion = useReducedMotion();

    return (
        <SectionWrapper className="bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-[1100px] mx-auto">
                <motion.div
                    className="relative max-w-4xl mx-auto text-center p-12 md:p-16 rounded-3xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #3d4f5f 0%, #3a4a5a 50%, #37454f 100%)',
                        boxShadow: '0px 30px 80px rgba(0,0,0,0.18), inset 0px 1px 0px rgba(255,255,255,0.06)'
                    }}
                    whileHover={prefersReducedMotion ? {} : {
                        boxShadow: '0px 35px 90px rgba(0,0,0,0.22), inset 0px 1px 0px rgba(255,255,255,0.08), 0 0 60px rgba(37, 99, 235, 0.15)',
                        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                    }}
                >
                    {/* Content */}
                    <div className="relative z-10">
                        {/* Top Badge */}
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8"
                            style={{
                                background: '#2563eb',
                                border: '1px solid rgba(37, 99, 235, 0.5)',
                                color: '#ffffff'
                            }}
                        >
                            <Calendar className="w-4 h-4" style={{ color: '#ffffff' }} />
                            Get Started Today
                        </div>

                        {/* Heading */}
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                            Ready to Automate{' '}
                            <span
                                style={{
                                    color: '#3b9eff'
                                }}
                            >
                                Your<br />Revenue?
                            </span>
                        </h2>

                        {/* Subheading */}
                        <p
                            className="text-base md:text-lg mb-10 max-w-[700px] mx-auto leading-relaxed"
                            style={{ color: '#cbd5e1' }}
                        >
                            Join hundreds of businesses that have transformed their sales with AI. See SalesPal in action with a personalized demo.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/contact">
                                <button
                                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5"
                                    style={{
                                        background: '#3b82f6',
                                        boxShadow: '0px 8px 20px rgba(59, 130, 246, 0.3)',
                                        minHeight: '52px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#2563eb';
                                        e.currentTarget.style.boxShadow = '0px 12px 30px rgba(59, 130, 246, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#3b82f6';
                                        e.currentTarget.style.boxShadow = '0px 8px 20px rgba(59, 130, 246, 0.3)';
                                    }}
                                >
                                    Book Your Demo
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>

                            <Link to="/contact">
                                <button
                                    className="px-8 py-3 rounded-xl font-semibold border-2 border-white/30 text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:border-transparent transition-all duration-300"
                                >
                                    Contact Sales
                                </button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </SectionWrapper>
    );
};

export default FinalCTA;
