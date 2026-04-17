import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Rocket, Crown } from 'lucide-react';

const OverviewBar = ({ activeCount, hasSalesPal360, onUpgrade, onExplore }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 shadow-xl"
        >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex-1"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-yellow-300" />
                            <p className="text-white text-lg font-semibold">
                                Active Plans: {activeCount}
                            </p>
                        </div>
                        <p className="text-indigo-100 text-sm opacity-90">
                            {hasSalesPal360
                                ? "You're on SalesPal 360 — all modules unlocked"
                                : "Upgrade to SalesPal 360 to unlock all modules and higher limits"}
                            <Rocket className="w-4 h-4 inline-block ml-1.5 -mt-0.5" />
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-3"
                    >
                        {hasSalesPal360 ? (
                            <>
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-1.5">
                                    <Crown className="w-3.5 h-3.5 text-yellow-300" />
                                    Premium Plan Active
                                </span>
                                <button
                                    onClick={onExplore}
                                    className="bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform duration-200 whitespace-nowrap"
                                >
                                    Explore Features
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onUpgrade}
                                className="bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform duration-200 flex items-center gap-2 whitespace-nowrap group"
                            >
                                Upgrade to SalesPal 360
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default OverviewBar;
