import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, Volume2, User, Sparkles, Phone, LayoutDashboard, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';

const DemoCallScreen = ({ formData, onEndCall }) => {
    const [screenState, setScreenState] = useState('dialing'); // dialing | connected | summary
    const [seconds, setSeconds] = useState(0);
    const [activeMessage, setActiveMessage] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [session, setSession] = useState(null);
    const [enrichedAiIndexes, setEnrichedAiIndexes] = useState({});
    const navigate = useNavigate();

    // Generate a mock conversation based on their script
    const baseScript = formData.scriptContent ? formData.scriptContent.split('\n').filter(l => l.trim()) : [
        `Hi ${formData.name || 'there'}! I'm calling regarding your premium property in ${formData.location || 'your area'}.`,
        'I noticed you offer great options and wanted to see if you have any availability to talk?'
    ];

    const [conversation, setConversation] = useState([
        { role: 'ai', text: baseScript[0] || 'Hello, I am calling from SalesPal.' },
        { role: 'user', text: 'Yes, tell me more about what you do.' },
        { role: 'ai', text: baseScript[1] || 'We automate your lead follow-ups utilizing human-like conversational voice AI.' },
        { role: 'ai', text: 'Our agents can qualify inbound interest and book appointments directly on your calendar, running 24/7. How does that sound?' },
        { role: 'user', text: 'Hmm, that actually sounds incredibly useful. Can you send me some details?' },
        { role: 'ai', text: 'Absolutely! I will drop a demo link to your email right away. Have a great day!' }
    ]);

    useEffect(() => {
        if (screenState === 'dialing') {
            const dialTimer = setTimeout(() => {
                setScreenState('connected');
            }, 3000);
            return () => clearTimeout(dialTimer);
        }
    }, [screenState]);

    useEffect(() => {
        const startVoiceSession = async () => {
            if (screenState !== 'connected') return;
            try {
                const res = await api.post('/api/demo/voice/start', {
                    brandId: 'web-demo',
                    phone: formData.phone || '+1 (555) 000-0000',
                    name: formData.name || 'Demo User',
                    locale: 'hing',
                });
                setSession({
                    brandId: res?.brand_id || 'web-demo',
                    leadId: res?.lead_id || null,
                    conversationId: res?.conversation_id || null,
                });
                if (res?.assistant_reply) {
                    setConversation((prev) => {
                        const next = [...prev];
                        if (next[0]?.role === 'ai') {
                            next[0] = { ...next[0], text: res.assistant_reply };
                        }
                        return next;
                    });
                }
            } catch (err) {
                console.warn('Demo voice session unavailable, using local fallback.', err?.message || err);
            }
        };
        startVoiceSession();
    }, [screenState, formData.phone, formData.name]);

    useEffect(() => {
        const enrichAssistantTurn = async () => {
            if (screenState !== 'connected') return;
            if (!session?.conversationId) return;
            if (activeMessage <= 0) return;
            if (enrichedAiIndexes[activeMessage]) return;

            const current = conversation[activeMessage];
            const prev = conversation[activeMessage - 1];
            if (!current || current.role !== 'ai' || !prev || prev.role !== 'user') return;

            try {
                const turn = await api.post('/api/demo/voice/turn', {
                    brandId: session.brandId,
                    leadId: session.leadId,
                    conversationId: session.conversationId,
                    text: prev.text,
                });
                const reply = turn?.assistant_reply;
                if (reply) {
                    setConversation((prevConv) => {
                        const next = [...prevConv];
                        if (next[activeMessage]) next[activeMessage] = { ...next[activeMessage], text: reply };
                        return next;
                    });
                }
                setEnrichedAiIndexes((prevMap) => ({ ...prevMap, [activeMessage]: true }));
            } catch (err) {
                console.warn('Demo voice turn failed, preserving fallback line.', err?.message || err);
                setEnrichedAiIndexes((prevMap) => ({ ...prevMap, [activeMessage]: true }));
            }
        };
        enrichAssistantTurn();
    }, [screenState, activeMessage, session, conversation, enrichedAiIndexes]);

    useEffect(() => {
        let interval;
        if (screenState === 'connected') {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [screenState]);

    useEffect(() => {
        if (screenState === 'connected' && activeMessage < conversation.length) {
            const currentMsg = conversation[activeMessage];
            // Simulate reading/thinking time based on length
            const timeToRead = currentMsg.role === 'ai' ? Math.max(2500, currentMsg.text.length * 40) : 1500;
            
            const lineTimer = setTimeout(() => {
                setActiveMessage(prev => prev + 1);
            }, timeToRead);

            return () => clearTimeout(lineTimer);
        }
        
        if (screenState === 'connected' && activeMessage >= conversation.length) {
            // Auto end call a few seconds after last message
            const endTimer = setTimeout(() => {
                setScreenState('summary');
            }, 3000);
            return () => clearTimeout(endTimer);
        }
    }, [screenState, activeMessage, conversation.length]);

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleEndCallAction = () => {
        if (screenState !== 'summary') {
            setScreenState('summary');
        } else {
            onEndCall();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/90 overflow-hidden">
            
            {/* Visualizer Background */}
            {screenState === 'connected' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
                    <div className="w-96 h-96 rounded-full bg-blue-500 animate-ping" style={{ animationDuration: '3s' }}></div>
                    <div className="w-[500px] h-[500px] rounded-full bg-purple-500 animate-ping absolute" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {screenState === 'dialing' && (
                    <motion.div 
                        key="dialing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center justify-center relative z-10 w-full max-w-md"
                    >
                        <div className="relative mb-8">
                            <motion.div 
                                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }} 
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute inset-0 bg-blue-500 rounded-full blur-xl"
                            />
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-blue-500/50">
                                <Phone className="w-10 h-10 text-white animate-pulse" />
                            </div>
                        </div>
                        
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">SalesPal AI Engine</h2>
                        <div className="flex items-center gap-1 text-slate-400 font-medium text-lg mb-8">
                            Dialing
                            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>.</motion.span>
                            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>.</motion.span>
                            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}>.</motion.span>
                        </div>

                        <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-md flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-sm border-white/20 text-slate-400">Connecting to</p>
                                <p className="text-white font-mono text-lg tracking-wider">{formData.phone || '+1 (555) 000-0000'}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {screenState === 'connected' && (
                    <motion.div 
                        key="connected"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-2xl bg-slate-900/80 border border-slate-700 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col h-[80vh] relative z-10"
                    >
                        {/* Connected Top Bar */}
                        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-slate-900 z-10 relative">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50"></div>
                                </div>
                                <div>
                                    <p className="text-white font-semibold flex items-center gap-2">
                                        SalesPal AI
                                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                            Connected
                                        </span>
                                    </p>
                                    <p className="text-slate-400 text-sm font-mono">{formatTime(seconds)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Chat / Conversation Area */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                            {conversation.map((msg, index) => {
                                const isPast = index < activeMessage;
                                const isCurrent = index === activeMessage;
                                const isFuture = index > activeMessage;

                                if (isFuture) return null;

                                const isAI = msg.role === 'ai';

                                return (
                                    <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex flex-col max-w-[85%] ${isAI ? 'self-start' : 'self-end'}`}
                                    >
                                        <div className={`flex items-center gap-2 mb-1.5 px-1 ${isAI ? 'justify-start text-blue-400' : 'justify-end text-emerald-400'}`}>
                                            {isAI ? (
                                                <>
                                                    <Volume2 className={`w-3.5 h-3.5 ${isCurrent ? 'animate-pulse' : ''}`} />
                                                    <span className="text-xs font-bold tracking-wider uppercase">AI Agent</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xs font-bold tracking-wider uppercase">User</span>
                                                    <Mic className={`w-3.5 h-3.5 ${isCurrent ? 'animate-pulse' : ''}`} />
                                                </>
                                            )}
                                        </div>
                                        
                                        <div className={`p-4 rounded-2xl ${
                                            isAI 
                                              ? isCurrent ? 'bg-blue-600/20 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] text-white' : 'bg-slate-800/50 border border-slate-700/50 text-slate-300'
                                              : isCurrent ? 'bg-emerald-600/20 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] text-white' : 'bg-slate-800/50 border border-slate-700/50 text-slate-300'
                                        }`}>
                                            <p className="text-lg leading-relaxed">
                                                {isCurrent ? (
                                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                                                        {msg.text.split(/(?=[^\s])/).map((char, i) => (
                                                            <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.05, delay: i * 0.02 }}>
                                                                {char}
                                                            </motion.span>
                                                        ))}
                                                    </motion.span>
                                                ) : (
                                                    msg.text
                                                )}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            
                            {/* Listening / Speaking Indicator */}
                            {activeMessage < conversation.length && (
                                <div className="flex justify-center mt-4">
                                    <div className="bg-slate-800/50 backdrop-blur-md rounded-full px-4 py-2 border border-slate-700 flex items-center gap-2">
                                        {conversation[activeMessage].role === 'ai' ? (
                                            <>
                                                <div className="flex items-center gap-1">
                                                    <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-blue-400 rounded-full"></motion.div>
                                                    <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 bg-blue-400 rounded-full"></motion.div>
                                                    <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 bg-blue-400 rounded-full"></motion.div>
                                                </div>
                                                <span className="text-xs text-blue-400 font-medium uppercase tracking-wider ml-1">AI Speaking</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1 h-3 bg-emerald-400/30 rounded-full"></div>
                                                    <div className="w-1 h-4 bg-emerald-400/30 rounded-full"></div>
                                                    <div className="w-1 h-3 bg-emerald-400/30 rounded-full"></div>
                                                </div>
                                                <span className="text-xs text-emerald-400/50 font-medium uppercase tracking-wider ml-1">Listening</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls Bar */}
                        <div className="bg-slate-900 border-t border-slate-800 px-6 py-6 flex justify-center items-center gap-8">
                            <motion.button 
                                whileHover={{ y: -2, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsMuted(!isMuted)}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                                    isMuted ? 'bg-slate-700 text-red-400 border border-red-500/20' : 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'
                                }`}
                            >
                                <Mic className="w-6 h-6" />
                            </motion.button>
                            
                            <motion.button 
                                whileHover={{ y: -2, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleEndCallAction}
                                className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                            >
                                <PhoneOff className="w-8 h-8" />
                            </motion.button>

                            <motion.button 
                                whileHover={{ y: -2, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center hover:bg-slate-700 shadow-lg"
                            >
                                <User className="w-6 h-6" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {screenState === 'summary' && (
                    <motion.div 
                        key="summary"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
                    >
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="mx-auto w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mb-4 relative z-10">
                                <CheckCircle2 className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white relative z-10">Call Completed</h2>
                            <p className="text-slate-400 mt-2 relative z-10">Duration: {formatTime(seconds)}</p>
                        </div>
                        
                        <div className="p-8">
                            <div className="space-y-6 mb-8">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">AI Call Summary</h4>
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-900 text-sm leading-relaxed">
                                        <strong>Successful interaction.</strong> User showed strong interest in the AI automation workflow for property {formData.propertyName || 'listings'}. An appointment booking flow was initiated and demo link was captured.
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-xs font-semibold text-slate-400 mb-1">Sentiment</p>
                                        <p className="font-bold text-emerald-600 flex items-center gap-1">Highly Positive</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-xs font-semibold text-slate-400 mb-1">Goal Status</p>
                                        <p className="font-bold text-blue-600 flex items-center gap-1">Demo Scheduled</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => navigate('/sales')}
                                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    View Lead in Dashboard
                                </button>
                                <button 
                                    onClick={onEndCall}
                                    className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCcw className="w-5 h-5" />
                                    Try Another Demo
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DemoCallScreen;
