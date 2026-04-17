import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Activity, Home, FileText, Sparkles, CheckCircle2, PhoneCall } from 'lucide-react';

const DynamicPanel = ({ currentStep, formData }) => {

    const renderContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-6">
                        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 relative overflow-hidden">
                            {/* Animated Pulse Icon */}
                            <div className="absolute -right-4 -top-4 opacity-10">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                    className="bg-blue-500 rounded-full p-8"
                                >
                                    <PhoneCall className="w-16 h-16 text-white" />
                                </motion.div>
                            </div>

                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4 relative z-10">
                                <ShieldCheck className="w-5 h-5" />
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={formData.name || 'default'}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative z-10"
                                >
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        {formData.name ? `Hi ${formData.name.split(' ')[0]},` : 'Secure Verification'}
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {formData.phone ? (
                                            <span>
                                                We'll verify <strong>{formData.phone}</strong> to simulate a real AI call. Once verified, our live telephony engine will actively dial this number.
                                            </span>
                                        ) : (
                                            "We verify your number to simulate a real AI call. Once verified, our live telephony engine will actively call the provided number to give you the best conversational AI experience."
                                        )}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <Lock className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-sm font-medium text-slate-700">Bank-level encryption</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span className="text-sm font-medium text-slate-700">No spam, strict privacy</span>
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Plan Context</h3>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                The AI persona behaves differently depending on the plan you choose.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-700">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                                    <span><strong>Sales:</strong> Focuses on persuasion & outbound.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                                    <span><strong>Marketing:</strong> Warms up leads & qualifications.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5" />
                                    <span><strong>Support:</strong> Empathetic problem solving.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                                <Home className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Knowledge Base Tips</h3>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                For the best AI performance, provide clear attributes about the property:
                            </p>
                            <div className="space-y-3">
                                {formData.propertyName && (
                                    <div className="p-3 bg-white rounded-lg border border-emerald-100 text-sm">
                                        <span className="text-emerald-700 font-medium">Tracking:</span> {formData.propertyName}
                                    </div>
                                )}
                                {formData.location && (
                                    <div className="p-3 bg-white rounded-lg border border-emerald-100 text-sm">
                                        <span className="text-emerald-700 font-medium">Area Focus:</span> {formData.location}
                                    </div>
                                )}
                                <p className="text-xs text-slate-500 italic mt-2">
                                    The AI actively monitors this logic to answer hypothetical questions smoothly on the call.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Script Generation</h3>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                {formData.scriptOption === 'ai'
                                    ? 'SalesPal AI is crafting a highly converting conversation based on your inputs. It will sound natural, handle objections seamlessly, and adapt on the fly.'
                                    : 'You have complete creative control. You can instruct the agent on exact guardrails, greetings, and closing pitches.'}
                            </p>

                            <div className="relative p-4 bg-slate-900 rounded-xl overflow-hidden group border border-slate-800">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
                                <div className="relative flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live Preview</span>
                                    </div>
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                </div>
                                <div className="text-sm text-slate-300 italic font-mono relative overflow-hidden whitespace-pre-wrap">
                                    {formData.scriptOption === 'ai' ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 1 }}
                                        >
                                            &gt; <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}>Generating optimal hook...</motion.span>
                                            <br />
                                            <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2, duration: 2 }}>
                                                &gt; "Hi {formData.name || 'there'}! I'm calling regarding your premium property {formData.propertyName ? `"${formData.propertyName}"` : ''} in {formData.location || 'your area'}.{formData.price ? ` I noticed the offer for ${formData.price} and wanted to connect...` : '..'}"
                                            </motion.span>
                                        </motion.div>
                                    ) : (
                                        <span>
                                            {formData.scriptContent ? `> ${formData.scriptContent.substring(0, 100)}...` : "> Awaiting manual script input..."}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <ShieldCheck className="w-32 h-32" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-semibold tracking-widest uppercase text-slate-300">System Ready</span>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-4">All Set for Lift-off</h3>
                                <p className="text-slate-400 leading-relaxed mb-8">
                                    Once you hit Start Demo, our real-time telephony server will initiate the call. Get ready to experience the future of autonomous revenue.
                                </p>

                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">Target ETA:</span>
                                        <span className="text-white font-mono">&lt; 5 seconds</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-2">
                                        <span className="text-slate-400">Latency:</span>
                                        <span className="text-white font-mono">~300ms</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white -z-10" />
            <div className="p-8 h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DynamicPanel;
