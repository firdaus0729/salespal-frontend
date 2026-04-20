import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSales } from '../../context/SalesContext';
import {
    ArrowLeft, Phone, MessageSquare, Calendar, Edit3, TrendingUp,
    X, Check, Mic, Volume2, Send, FileText, Play, Pause, Download,
    BrainCircuit, Clock, Star, Activity, Users, ChevronRight,
    Zap, Target, Heart, BarChart3, BookOpen, CheckCircle,
    AlertCircle, Info, PlusCircle, RefreshCw, Award, Mail,
    MapPin, ExternalLink
} from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

/* ─── Status config ─────────────────────────────────────────── */
const STATUS_CONFIG = {
    New: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    Contacted: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    Hot: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    Warm: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    Cold: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
    'Follow-up Scheduled': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    Converted: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    Won: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    Closed: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
    Lost: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
};

const STATUSES = ['New', 'Contacted', 'Hot', 'Warm', 'Cold', 'Follow-up Scheduled', 'Converted', 'Closed', 'Lost'];

const TIMELINE_ICONS = {
    capture: { icon: Zap, color: 'bg-blue-100 text-blue-600' },
    ai_action: { icon: BrainCircuit, color: 'bg-purple-100 text-purple-600' },
    call: { icon: Phone, color: 'bg-indigo-100 text-indigo-600' },
    whatsapp: { icon: MessageSquare, color: 'bg-green-100 text-green-600' },
    meeting: { icon: Calendar, color: 'bg-orange-100 text-orange-600' },
    note: { icon: Edit3, color: 'bg-gray-100 text-gray-600' },
    converted: { icon: Award, color: 'bg-emerald-100 text-emerald-600' },
    default: { icon: Activity, color: 'bg-gray-100 text-gray-500' },
};

const AGENTS = ['AI Agent', 'Alex Rep', 'Sarah Closer', 'Mike Seller', 'John Doe', 'Jane Smith'];

/** Strip common AI email-style placeholders from WhatsApp drafts */
function sanitizeWhatsappAiReply(text) {
    let s = String(text || '');
    s = s.replace(/\s*\[Your Name\]\s*/gi, ' ');
    s = s.replace(/\s*\[(?:Your\s+)?Name\]\s*/gi, ' ');
    s = s.replace(/\bBest regards,\s*$/gim, '');
    s = s.replace(/\s{2,}/g, ' ').trim();
    return s;
}

/** Keeps SpeechSynthesis in the same user-activation chain as the tap (needed after await fetch). */
function primeSpeechSynthesisFromUserGesture() {
    if (typeof window === 'undefined' || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') {
        return;
    }
    try {
        window.speechSynthesis.resume();
        const u = new window.SpeechSynthesisUtterance('\u00A0');
        u.volume = 0;
        window.speechSynthesis.speak(u);
    } catch (_) {
        /* ignore */
    }
}

/* ─── Small Components ───────────────────────────────────────── */
const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
        <div className="flex items-center gap-1.5 shrink-0">
            {Icon && <Icon size={13} className="text-gray-400" />}
            <span className="text-xs text-gray-400 font-medium">{label}</span>
        </div>
        <span className="text-xs font-semibold text-gray-800 text-right">{value || '—'}</span>
    </div>
);

const SectionCard = ({ title, icon: Icon, iconColor, children, className = '' }) => (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            {Icon && <Icon size={15} className={iconColor || 'text-blue-600'} />}
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h2>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

/* ─── Main Component ─────────────────────────────────────────── */
const SalesLeadWorkspace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { leads, updateLeadStatus, addActionToLead, assignLead } = useSales();
    const { showToast } = useToast();

    const lead = useMemo(() => leads.find(l => l.id === id), [leads, id]);

    // Modal
    const [modal, setModal] = useState(null);
    const [playingId, setPlayingId] = useState(null);
    const [transcriptId, setTranscriptId] = useState(null);
    const [activeTab, setActiveTab] = useState('timeline');

    // Modal form state
    const [waText, setWaText] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [noteText, setNoteText] = useState('');
    const [startingLiveCall, setStartingLiveCall] = useState(false);
    const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [voiceSession, setVoiceSession] = useState(null);
    const speechRef = useRef(null);
    const recognitionRef = useRef(null);
    /** Synchronous guard — state updates lag behind recognition.onend; prevents restart loops after End Call */
    const callActiveRef = useRef(false);
    const micMutedRef = useRef(false);
    const listenRestartTimeoutRef = useRef(null);
    /** Prevents double /ai/voice/session/start (double-click, Strict Mode, or rapid taps) */
    const voiceSessionStartLockRef = useRef(false);
    /** User closed modal during connect — ignore late API response */
    const voiceCallDismissedRef = useRef(false);
    /** Stops duplicate onresult bursts from firing multiple /voice/session/turn requests */
    const lastVoiceDupRef = useRef({ text: '', at: 0 });
    const [isListening, setIsListening] = useState(false);
    const [lastHeardText, setLastHeardText] = useState('');
    const [isProcessingTurn, setIsProcessingTurn] = useState(false);
    /** Parsed from GET /integrations/readiness (calling.* only; ignores Google Ads blockers). */
    const [aiReadiness, setAiReadiness] = useState({
        loading: true,
        /** /ai/chat — needs AI_API_KEY on backend */
        chatReady: false,
        /** Voice session — needs AI_API_KEY + DB tables ai_voice_sessions / ai_voice_turns */
        voiceReady: false,
        issuesChat: [],
        issuesVoice: [],
    });

    const openModal = (type) => {
        setWaText(''); setScheduleDate(''); setScheduleTime(''); setNoteText('');
        if (type === 'call') {
            voiceCallDismissedRef.current = false;
        }
        setModal(type);
        if (type !== 'call') {
            setIsCallActive(false);
        }
    };

    const clearPendingListenRestart = () => {
        if (listenRestartTimeoutRef.current != null) {
            clearTimeout(listenRestartTimeoutRef.current);
            listenRestartTimeoutRef.current = null;
        }
    };

    const stopSpeaking = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        speechRef.current = null;
    };

    const speakText = (text) => {
        if (!text || isSpeakerMuted) return;
        if (typeof window === 'undefined' || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') {
            return;
        }
        stopSpeaking();
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const stopListening = () => {
        clearPendingListenRestart();
        try {
            if (recognitionRef.current) {
                recognitionRef.current.onresult = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.onend = null;
                recognitionRef.current.stop();
            }
        } catch (_) {
            // no-op
        } finally {
            recognitionRef.current = null;
            setIsListening(false);
        }
    };

    const handleVoiceTurn = async (heardText) => {
        const text = String(heardText || '').trim();
        if (!text || !voiceSession?.conversationId || isProcessingTurn) return;
        if (!callActiveRef.current) return;
        const now = Date.now();
        if (text === lastVoiceDupRef.current.text && now - lastVoiceDupRef.current.at < 1200) {
            return;
        }
        lastVoiceDupRef.current = { text, at: now };

        setIsProcessingTurn(true);
        try {
            addActionToLead(lead.id, 'call', 'Lead Spoke', text, { outcome: 'In conversation' });
            const turn = await api.post('/ai/voice/session/turn', {
                brandId: voiceSession.brandId,
                leadId: voiceSession.leadId,
                conversationId: voiceSession.conversationId,
                text,
            });

            const reply = turn?.assistant_reply ? String(turn.assistant_reply).trim() : '';
            if (reply && callActiveRef.current) {
                addActionToLead(lead.id, 'call', 'AI Voice Reply', reply, { outcome: 'Responded' });
                speakText(reply);
            }
        } catch (err) {
            addActionToLead(lead.id, 'call', 'AI Voice Turn Failed', err?.message || 'Could not process voice turn.');
            showToast({
                title: 'Voice turn failed',
                description: err?.message || 'Could not process your speech input.',
                variant: 'error',
            });
        } finally {
            setIsProcessingTurn(false);
        }
    };

    const startListening = async () => {
        if (isMicMuted || !callActiveRef.current) return;
        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast({
                title: 'Speech recognition not supported',
                description: 'This browser does not support live voice capture. Use Chrome/Edge for best results.',
                variant: 'warning',
            });
            return;
        }

        if (recognitionRef.current) {
            const prev = recognitionRef.current;
            prev.onresult = null;
            prev.onerror = null;
            prev.onend = null;
            try {
                prev.stop();
            } catch (_) {
                /* ignore */
            }
            recognitionRef.current = null;
        }
        clearPendingListenRestart();
        setIsListening(false);

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-IN';
            recognition.interimResults = false;
            recognition.continuous = true;
            recognition.maxAlternatives = 1;

            recognition.onresult = async (event) => {
                const result = event.results?.[event.resultIndex];
                const transcript = result?.[0]?.transcript?.trim() || '';
                if (!transcript) return;
                setLastHeardText(transcript);
                await handleVoiceTurn(transcript);
            };

            recognition.onerror = () => {
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
                if (!callActiveRef.current || micMutedRef.current) return;
                clearPendingListenRestart();
                listenRestartTimeoutRef.current = setTimeout(() => {
                    listenRestartTimeoutRef.current = null;
                    if (callActiveRef.current && !micMutedRef.current) {
                        startListening();
                    }
                }, 300);
            };

            recognitionRef.current = recognition;
            recognition.start();
            setIsListening(true);
        } catch (err) {
            setIsListening(false);
            showToast({
                title: 'Mic access issue',
                description: err?.message || 'Could not start microphone listening.',
                variant: 'error',
            });
        }
    };

    const startLiveAICall = async () => {
        if (voiceSessionStartLockRef.current || isCallActive || callActiveRef.current || startingLiveCall) {
            return;
        }
        if (!aiReadiness.voiceReady) {
            showToast({
                title: 'Voice AI is not ready',
                description: aiReadiness.issuesVoice[0] || 'Set AI_API_KEY and run DB migrations for voice tables.',
                variant: 'warning',
            });
            return;
        }
        voiceSessionStartLockRef.current = true;
        voiceCallDismissedRef.current = false;
        primeSpeechSynthesisFromUserGesture();
        setStartingLiveCall(true);
        try {
            const response = await api.post('/ai/voice/session/start', {
                leadId: lead.id,
                phone: lead.phone,
                name: lead.name,
                locale: 'hing',
            });
            if (voiceCallDismissedRef.current) {
                return;
            }
            setVoiceSession({
                brandId: response?.brand_id,
                leadId: response?.lead_id,
                conversationId: response?.conversation_id,
            });
            callActiveRef.current = true;
            setIsCallActive(true);
            if (response?.assistant_reply) speakText(response.assistant_reply);
            addActionToLead(
                lead.id,
                'call',
                'AI Voice Call Started',
                response?.assistant_reply || 'AI call started for this lead.',
                { outcome: 'Queued', duration: '0m 00s' }
            );
        } catch (err) {
            if (!voiceCallDismissedRef.current) {
                callActiveRef.current = false;
                addActionToLead(
                    lead.id,
                    'call',
                    'AI Voice Call Failed',
                    err?.message || 'Could not start AI voice call.'
                );
                showToast({
                    title: 'Call failed',
                    description: err?.message || 'Could not start AI voice call.',
                    variant: 'error',
                });
                setModal(null);
            }
        } finally {
            voiceSessionStartLockRef.current = false;
            setStartingLiveCall(false);
        }
    };

    const endLiveAICall = () => {
        voiceSessionStartLockRef.current = false;
        lastVoiceDupRef.current = { text: '', at: 0 };
        clearPendingListenRestart();
        callActiveRef.current = false;
        setIsProcessingTurn(false);
        stopListening();
        stopSpeaking();
        setIsCallActive(false);
        setVoiceSession(null);
        addActionToLead(lead.id, 'call', 'AI Voice Call Ended', 'Call ended by user.', { outcome: 'Completed' });
        setModal(null);
    };

    const sendAIAssistedWhatsApp = async (rawText) => {
        const text = String(rawText || '').trim();
        if (!text) return;
        if (!aiReadiness.chatReady) {
            showToast({
                title: 'WhatsApp AI is not ready',
                description: aiReadiness.issuesChat[0] || 'Set AI_API_KEY on the backend and restart the server.',
                variant: 'warning',
            });
            return;
        }
        setSendingWhatsApp(true);
        try {
            addActionToLead(lead.id, 'whatsapp', 'WhatsApp sent', text, { sender: 'SalesRep' });
            const ai = await api.post('/ai/chat', {
                context: 'whatsapp',
                message: `Lead name: ${lead.name}\nTheir message: ${text}\nWrite a concise WhatsApp reply as the sales rep (no email-style sign-off).`,
            });
            const aiReply = ai?.response ? sanitizeWhatsappAiReply(ai.response) : null;
            if (aiReply) {
                addActionToLead(lead.id, 'whatsapp', 'AI WhatsApp follow-up', aiReply, { sender: 'AI' });
                if (ai?.fallback) {
                    showToast({
                        title: 'AI fallback used',
                        description: 'Primary AI service is unavailable. Using fallback response.',
                        variant: 'warning',
                    });
                }
            }
            setWaText('');
        } catch (err) {
            const fallbackReply = `Thanks for your message, ${lead.name.split(' ')[0] || 'there'}. Our team is reviewing this and will reply shortly.`;
            addActionToLead(lead.id, 'whatsapp', 'AI WhatsApp follow-up', fallbackReply, { sender: 'AI' });
            addActionToLead(lead.id, 'whatsapp', 'WhatsApp AI fallback', err?.message || 'AI service unavailable');
            showToast({
                title: 'AI chat unavailable',
                description: 'Sent a fallback reply so the conversation can continue.',
                variant: 'warning',
            });
        } finally {
            setSendingWhatsApp(false);
        }
    };

    useEffect(() => {
        if (isSpeakerMuted) stopSpeaking();
    }, [isSpeakerMuted]);

    useEffect(() => {
        return () => {
            stopListening();
            stopSpeaking();
        };
    }, []);

    useEffect(() => {
        const loadReadiness = async () => {
            try {
                const data = await api.get('/integrations/readiness');
                const calling = data?.calling || {};
                const c = calling.checks || {};
                const chatReady = Boolean(c.aiApiConfigured);
                const voiceReady = Boolean(calling.ready);
                const issuesChat = [];
                const issuesVoice = [];
                if (!c.aiApiConfigured) {
                    issuesChat.push('Set AI_API_KEY in backend .env and restart the API server.');
                    issuesVoice.push('Set AI_API_KEY in backend .env and restart the API server.');
                }
                if (!c.voiceTablesPresent) {
                    issuesVoice.push('Run DB migrations so tables ai_voice_sessions and ai_voice_turns exist.');
                }
                setAiReadiness({
                    loading: false,
                    chatReady,
                    voiceReady,
                    issuesChat,
                    issuesVoice,
                });
            } catch (err) {
                setAiReadiness({
                    loading: false,
                    chatReady: false,
                    voiceReady: false,
                    issuesChat: [err?.message || 'Could not verify AI readiness.'],
                    issuesVoice: [err?.message || 'Could not verify AI readiness.'],
                });
            }
        };
        loadReadiness();
    }, []);

    useEffect(() => {
        micMutedRef.current = isMicMuted;
    }, [isMicMuted]);

    useEffect(() => {
        if (!isCallActive || isMicMuted) {
            stopListening();
            return;
        }
        startListening();
    }, [isCallActive, isMicMuted]);

    if (!lead) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gray-400">
                <AlertCircle size={48} className="text-gray-200" />
                <p className="font-medium text-gray-500">Lead not found</p>
                <button onClick={() => navigate('/sales/leads')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                    Back to Leads
                </button>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.New;
    const calls = (lead.communications || []).filter(c => c.type === 'call');
    const waComm = (lead.communications || []).find(c => c.type === 'whatsapp');
    const waHistory = waComm?.history || [];

    /* ── Score colour helpers ── */
    const scoreColor = (s) => s >= 80 ? 'text-red-600' : s >= 50 ? 'text-orange-500' : 'text-sky-500';
    const scoreBar = (s) => s >= 80 ? 'bg-red-500' : s >= 50 ? 'bg-orange-400' : 'bg-sky-400';

    /* ────────────────────────── MODAL ────────────────────────── */
    const renderModal = () => {
        if (!modal) return null;
        return (
            <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                    onClick={() => {
                        if (modal === 'call' && (isCallActive || startingLiveCall)) return;
                        setModal(null);
                    }}>
                    <motion.div
                        initial={{ scale: 0.95, y: 16, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 16, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                        onClick={e => e.stopPropagation()}
                        className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full ${modal === 'whatsapp' ? 'max-w-md' : 'max-w-sm'}`}
                    >
                        {/* CALL */}
                        {modal === 'call' && (
                            <div className="bg-gradient-to-b from-blue-900 to-blue-950 text-white flex flex-col">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (startingLiveCall && !isCallActive) {
                                            voiceCallDismissedRef.current = true;
                                            voiceSessionStartLockRef.current = false;
                                            setStartingLiveCall(false);
                                            setModal(null);
                                            return;
                                        }
                                        if (isCallActive) endLiveAICall();
                                        else setModal(null);
                                    }}
                                    className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/10 p-2 rounded-full"
                                >
                                    <X size={16} />
                                </button>
                                <div className="p-8 flex flex-col items-center text-center mt-2">
                                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-5 relative">
                                        <div className={`absolute inset-0 rounded-full border-4 ${startingLiveCall ? 'border-emerald-400/40 animate-ping' : isCallActive ? 'border-emerald-400/30' : 'border-white/20'}`} />
                                        <Phone size={36} className="text-white relative z-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold">{lead.name}</h3>
                                    <p className="text-blue-200 text-sm mt-1 font-medium tracking-widest">{lead.phone}</p>
                                    <div className="flex items-center gap-2 mt-6 bg-white/10 border border-white/10 px-4 py-2 rounded-full text-emerald-300 text-sm font-semibold max-w-[90%] flex-wrap justify-center">
                                        <span
                                            className={`w-2 h-2 rounded-full shrink-0 ${startingLiveCall ? 'bg-amber-400 animate-pulse' : isCallActive ? 'bg-emerald-400' : 'bg-slate-300'}`}
                                        />
                                        {startingLiveCall
                                            ? 'Connecting…'
                                            : isCallActive
                                              ? isProcessingTurn
                                                  ? 'Processing your speech…'
                                                  : isListening
                                                    ? 'Listening — speak naturally'
                                                    : 'Connected — mic ready'
                                              : 'Ready — tap the green button to start'}
                                    </div>
                                    {isCallActive && lastHeardText ? (
                                        <div className="mt-3 text-xs text-blue-100/90">Heard: “{lastHeardText}”</div>
                                    ) : null}
                                </div>
                                <div className="flex justify-center gap-6 pb-10">
                                    <button
                                        type="button"
                                        onClick={() => setIsMicMuted(prev => !prev)}
                                        disabled={!isCallActive}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${!isCallActive ? 'opacity-40 cursor-not-allowed' : ''} ${isMicMuted ? 'bg-red-500/80 text-white' : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'}`}
                                        title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                                    >
                                        <Mic size={22} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={isCallActive ? endLiveAICall : startLiveAICall}
                                        disabled={startingLiveCall}
                                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                                            isCallActive
                                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                                        }`}
                                        title={isCallActive ? 'End call' : 'Start AI call'}
                                    >
                                        <Phone size={26} className={isCallActive ? 'rotate-[135deg]' : ''} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsSpeakerMuted(prev => !prev)}
                                        disabled={!isCallActive}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${!isCallActive ? 'opacity-40 cursor-not-allowed' : ''} ${isSpeakerMuted ? 'bg-red-500/80 text-white' : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'}`}
                                        title={isSpeakerMuted ? 'Enable speaker' : 'Mute speaker'}
                                    >
                                        <Volume2 size={22} />
                                    </button>
                                </div>
                                <div className="pb-6 px-8 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={endLiveAICall}
                                        disabled={!isCallActive}
                                        className="text-xs font-semibold px-4 py-2 rounded-full border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        End Call
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* WHATSAPP */}
                        {modal === 'whatsapp' && (
                            <div className="flex flex-col" style={{ minHeight: 400 }}>
                                <div className="bg-[#075E54] text-white p-4 flex items-center gap-3">
                                    <button onClick={() => setModal(null)} className="text-white/70 hover:text-white"><X size={20} /></button>
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg shrink-0">{lead.name[0]}</div>
                                    <div>
                                        <p className="font-bold text-sm">{lead.name}</p>
                                        <p className="text-xs text-white/60">{lead.phone} · Online</p>
                                    </div>
                                </div>
                                <div className="flex-1 bg-[#ECE5DD] p-4 flex flex-col gap-2 min-h-[180px] overflow-y-auto">
                                    {waHistory.length > 0 ? waHistory.map(msg => (
                                        <div key={msg.id} className={`max-w-[80%] ${msg.sender === 'AI' ? 'self-start bg-white rounded-tl-none' : 'self-end bg-[#DCF8C6] rounded-tr-none'} p-2.5 rounded-xl shadow-sm text-sm text-gray-800`}>
                                            {msg.attachment && <p className="text-xs font-semibold text-blue-600 mb-1">📎 {msg.attachment}</p>}
                                            <p>{msg.text}</p>
                                            <p className="text-[10px] text-gray-400 text-right mt-0.5">{msg.time}</p>
                                        </div>
                                    )) : (
                                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Start a new conversation</div>
                                    )}
                                </div>
                                <div className="p-3 bg-gray-100 border-t border-gray-200 flex items-center gap-2">
                                    <div className="flex-1 bg-white flex items-center rounded-full px-3 py-2 shadow-sm border border-gray-200">
                                        <input type="text" value={waText} onChange={e => setWaText(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && waText.trim()) sendAIAssistedWhatsApp(waText); }}
                                            placeholder="Type a message..." className="flex-1 text-sm bg-transparent outline-none" />
                                    </div>
                                    <button onClick={() => sendAIAssistedWhatsApp(waText)}
                                        disabled={sendingWhatsApp}
                                        className="w-10 h-10 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-full flex items-center justify-center shadow-sm transition-colors">
                                        <Send size={15} className="ml-0.5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* SCHEDULE */}
                        {modal === 'schedule' && (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Calendar size={18} className="text-indigo-500" /> Schedule Follow-up</h3>
                                    <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">For <span className="font-semibold text-gray-800">{lead.name}</span></p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Date</label>
                                        <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Time Slot</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'].map(t => (
                                                <button key={t} onClick={() => setScheduleTime(t)}
                                                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${scheduleTime === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/50'}`}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { if (scheduleDate) addActionToLead(lead.id, 'meeting', 'Follow-up Scheduled', `Meeting on ${scheduleDate}${scheduleTime ? ' at ' + scheduleTime : ''}.`, { date: scheduleDate, time: scheduleTime }); setModal(null); }}
                                        className="w-full py-2.5 mt-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                                        <Check size={15} /> Confirm Follow-up
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* NOTE */}
                        {modal === 'note' && (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Edit3 size={16} className="text-gray-500" /> Add Note</h3>
                                    <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
                                </div>
                                <div className="space-y-3">
                                    <textarea rows="5" value={noteText} onChange={e => setNoteText(e.target.value)}
                                        placeholder={`Notes for ${lead.name}...`}
                                        className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
                                    <button onClick={() => { if (noteText.trim()) addActionToLead(lead.id, 'note', 'Note Added', noteText.trim()); setModal(null); }}
                                        className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg text-sm transition-colors">
                                        Save Note
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TRANSCRIPT */}
                        {modal === 'transcript' && transcriptId !== null && (() => {
                            const call = calls.find(c => c.id === transcriptId);
                            return (
                                <div className="flex flex-col max-h-[85vh]">
                                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><BookOpen size={16} className="text-blue-600" /> Call Transcript</h3>
                                        <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                                        {(call?.transcript || []).map((line, i) => (
                                            <div key={i} className={`flex gap-3 ${line.speaker === 'AI' ? 'flex-row' : line.speaker === 'Lead' ? 'flex-row-reverse' : 'justify-center'}`}>
                                                {line.speaker !== 'System' && (
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${line.speaker === 'AI' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                        {line.speaker[0]}
                                                    </div>
                                                )}
                                                <div className={`max-w-[80%] ${line.speaker === 'System' ? 'w-full text-center' : ''}`}>
                                                    {line.speaker !== 'System' && <p className="text-[10px] font-bold text-gray-400 mb-1">{line.speaker}</p>}
                                                    <div className={`p-3 rounded-xl text-sm ${line.speaker === 'AI' ? 'bg-white border border-gray-200 text-gray-800' : line.speaker === 'System' ? 'bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs text-center rounded-lg' : 'bg-blue-600 text-white'}`}>
                                                        {line.text}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!call?.transcript?.length) && <p className="text-center text-gray-400 text-sm py-8">No transcript available</p>}
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    };

    /* ──────────────────────── RENDER ──────────────────────────── */
    return (
        <div className="font-sans text-gray-900 pb-16">
            {renderModal()}

            {/* ─── Back + Header ─── */}
            <div className="mb-5">
                <button onClick={() => navigate('/sales/leads')}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-medium mb-3 transition-colors group">
                    <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back to Leads
                </button>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                            {lead.name[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                                    {lead.status === 'Won' ? 'Converted' : lead.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">{lead.phone} · {lead.source} · {lead.project}</p>
                            <div className="mt-2">
                                {(() => {
                                    const { loading, chatReady, voiceReady, issuesChat, issuesVoice } = aiReadiness;
                                    const allGreen = !loading && chatReady && voiceReady;
                                    const partial = !loading && chatReady && !voiceReady;
                                    const badgeClass = loading
                                        ? 'bg-gray-50 text-gray-600 border-gray-200'
                                        : allGreen
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200';
                                    const dotClass = loading ? 'bg-gray-400' : allGreen ? 'bg-emerald-500' : 'bg-amber-500';
                                    const label = loading
                                        ? 'Checking AI readiness...'
                                        : allGreen
                                            ? 'AI Ready'
                                            : partial
                                                ? 'Chat ready · run voice DB migration'
                                                : 'AI Setup Required';
                                    const tip = loading
                                        ? ''
                                        : allGreen
                                            ? 'WhatsApp AI and voice calls can use the configured API.'
                                            : [...issuesChat, ...issuesVoice].filter(Boolean).join(' | ');
                                    return (
                                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badgeClass}`} title={tip || label}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                                            {label}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => openModal('call')}
                            disabled={!aiReadiness.voiceReady}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600">
                            <Phone size={14} /> Call
                        </button>
                        <button onClick={() => openModal('whatsapp')}
                            disabled={!aiReadiness.chatReady}
                            className="px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg font-semibold flex items-center gap-2 text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#25D366]">
                            <MessageSquare size={14} /> WhatsApp
                        </button>
                        <button onClick={() => openModal('schedule')}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold flex items-center gap-2 text-sm hover:bg-gray-50 transition-colors">
                            <Calendar size={14} /> Schedule
                        </button>
                        <button onClick={() => openModal('note')}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold flex items-center gap-2 text-sm hover:bg-gray-50 transition-colors">
                            <Edit3 size={14} /> Note
                        </button>
                        {lead.status !== 'Won' && lead.status !== 'Converted' && (
                            <button onClick={() => { updateLeadStatus(lead.id, 'Won'); addActionToLead(lead.id, 'ai_action', 'Lead Converted', 'Marked as Converted manually.'); }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 text-sm shadow-sm transition-colors">
                                <TrendingUp size={14} /> Mark Converted
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── AI Score Cards ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-100 rounded-[1rem] p-5 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-1">
                        <span className={`text-2xl font-semibold tracking-tight leading-tight ${scoreColor(lead.aiScore || 0)}`}>{lead.aiScore ?? '—'}</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreBar(lead.aiScore || 0)}`} style={{ width: `${lead.aiScore || 0}%` }} />
                        </div>
                    </div>
                    <p className="text-[13px] text-gray-500">AI Lead Score</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-[1rem] p-5 shadow-sm flex flex-col justify-center">
                    <h3 className="text-2xl font-semibold tracking-tight leading-tight text-indigo-600 mb-1">{lead.dealProbability ? `${lead.dealProbability}%` : '—'}</h3>
                    <p className="text-[13px] text-gray-500">Deal Probability</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-[1rem] p-5 shadow-sm flex flex-col justify-center">
                    <h3 className={`text-2xl font-semibold tracking-tight leading-tight mb-1 ${lead.scoreLabel === 'Hot' ? 'text-red-600' : lead.scoreLabel === 'Warm' ? 'text-orange-500' : 'text-sky-500'}`}>
                        {lead.scoreLabel || 'Warm'}
                    </h3>
                    <p className="text-[13px] text-gray-500">Intent Level</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-[1rem] p-5 shadow-sm flex flex-col justify-center">
                    <h3 className="text-2xl font-semibold tracking-tight leading-tight text-gray-900 mb-1">{(lead.timeline || []).length}</h3>
                    <p className="text-[13px] text-gray-500">Interactions</p>
                </div>
            </div>

            {/* ─── Main Layout ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── LEFT COLUMN ── */}
                <div className="lg:col-span-1 space-y-4">

                    {/* Lead Profile */}
                    <SectionCard title="Lead Profile" icon={Users} iconColor="text-blue-600">
                        {/* Status Selector */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-gray-500 font-medium">Status</span>
                            <select value={lead.status} onChange={e => updateLeadStatus(lead.id, e.target.value)}
                                className={`text-xs font-semibold rounded-md px-2.5 py-1 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                                {STATUSES.map(s => <option key={s} value={s}>{s === 'Won' ? 'Converted' : s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-0">
                            <InfoRow label="Phone" value={lead.phone} icon={Phone} />
                            <InfoRow label="Email" value={lead.email} icon={Mail} />
                            <InfoRow label="Source" value={lead.source} icon={ExternalLink} />
                            <InfoRow label="Campaign" value={lead.campaign} icon={Target} />
                            <InfoRow label="Project" value={lead.project} icon={BookOpen} />
                            <InfoRow label="Location" value={lead.location} icon={MapPin} />
                        </div>
                        {/* Assign */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <label className="text-xs text-gray-400 font-medium block mb-1.5">Assigned Owner</label>
                            <select value={lead.assignedTo || ''} onChange={e => assignLead(lead.id, e.target.value)}
                                className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer">
                                <option value="" disabled>Select agent</option>
                                {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-3">Created: {new Date(lead.createdDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </SectionCard>

                    {/* AI Insights */}
                    <SectionCard title="AI Intelligence" icon={BrainCircuit} iconColor="text-purple-600">
                        <div className="space-y-3">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-1">Context</p>
                                <p className="text-sm text-blue-900 leading-relaxed">{lead.insight || 'AI is analysing lead behaviour.'}</p>
                            </div>
                            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide mb-1">Recommendation</p>
                                <p className="text-sm text-purple-900 leading-relaxed">{lead.recommendation || 'No recommendation yet.'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className="flex flex-col gap-1 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">Sentiment</p>
                                    <p className="text-sm font-bold text-emerald-800">Positive</p>
                                </div>
                                <div className="flex flex-col gap-1 bg-orange-50 border border-orange-100 rounded-lg p-3">
                                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide">Priority</p>
                                    <p className="text-sm font-bold text-orange-800">{lead.scoreLabel || 'Normal'}</p>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Follow-ups */}
                    <SectionCard title="Follow-ups" icon={Calendar} iconColor="text-orange-500">
                        <div className="space-y-2 mb-3">
                            {(lead.followups || []).length > 0 ? (lead.followups || []).map(fu => (
                                <div key={fu.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 hover:border-orange-200 transition-colors">
                                    <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${fu.status === 'Pending' ? 'bg-orange-400' : 'bg-emerald-500'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{fu.task}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{fu.time}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${fu.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>{fu.status}</span>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 text-center py-4">No follow-ups scheduled</p>
                            )}
                        </div>
                        <button onClick={() => openModal('schedule')}
                            className="w-full py-2 border border-dashed border-indigo-300 text-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                            <PlusCircle size={15} /> Schedule Follow-up
                        </button>
                    </SectionCard>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Tabs */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                        {[
                            { key: 'timeline', label: 'Timeline', icon: Activity },
                            { key: 'calls', label: `Calls (${calls.length})`, icon: Phone },
                            { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <tab.icon size={14} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── TIMELINE TAB ── */}
                    {activeTab === 'timeline' && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
                                <Activity size={15} className="text-blue-600" />
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Activity Timeline</h2>
                                <span className="ml-auto text-xs text-gray-400">{(lead.timeline || []).length} events</span>
                            </div>
                            <div className="p-5">
                                {(lead.timeline || []).length > 0 ? (
                                    <div className="relative">
                                        <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-100" />
                                        <div className="space-y-4">
                                            {(lead.timeline || []).map((event, idx) => {
                                                const cfg = TIMELINE_ICONS[event.type] || TIMELINE_ICONS.default;
                                                const Ico = cfg.icon;
                                                return (
                                                    <motion.div key={event.id || idx}
                                                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.04 }}
                                                        className="flex gap-4 relative">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${cfg.color}`}>
                                                            <Ico size={14} />
                                                        </div>
                                                        <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-3 hover:bg-gray-100/70 transition-colors">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-sm font-semibold text-gray-800 truncate">{event.action}</p>
                                                                <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{event.time}</span>
                                                            </div>
                                                            {event.detail && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{event.detail}</p>}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <Activity size={36} className="text-gray-200 mx-auto mb-3" />
                                        <p className="text-sm">No activity yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── CALLS TAB ── */}
                    {activeTab === 'calls' && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
                                <Phone size={15} className="text-indigo-600" />
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Call History</h2>
                            </div>
                            <div className="p-5 space-y-4">
                                {calls.length > 0 ? calls.map(call => (
                                    <div key={call.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${call.outcome === 'Qualified' ? 'bg-emerald-100 text-emerald-600' : call.outcome === 'No Answer' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                                                    <Phone size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{call.outcome || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-400">{call.time} · {call.duration}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${call.outcome === 'Qualified' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{call.outcome}</span>
                                        </div>
                                        {call.recording && (
                                            <div className="px-4 py-3 bg-indigo-50/60 border-b border-gray-100 flex items-center gap-3">
                                                <button onClick={() => setPlayingId(playingId === call.id ? null : call.id)}
                                                    className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm">
                                                    {playingId === call.id ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                                                </button>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-semibold text-indigo-700">{call.recording}</span>
                                                        <span className="text-[10px] text-indigo-400">{call.duration}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                                                        <motion.div animate={{ width: playingId === call.id ? '45%' : '0%' }}
                                                            transition={{ duration: playingId === call.id ? 2 : 0 }}
                                                            className="h-full bg-indigo-600 rounded-full" />
                                                    </div>
                                                </div>
                                                <button className="p-1.5 text-indigo-500 hover:text-indigo-700 rounded hover:bg-indigo-100 transition-colors">
                                                    <Download size={14} />
                                                </button>
                                            </div>
                                        )}
                                        <div className="px-4 py-3">
                                            {call.sentiment > 0 && (
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Star size={12} className="text-yellow-400" />
                                                    <p className="text-xs text-gray-500">Sentiment score: <span className="font-bold text-emerald-600">{call.sentiment}%</span></p>
                                                </div>
                                            )}
                                            {(call.transcript || []).length > 0 && (
                                                <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-28 overflow-hidden relative">
                                                    {call.transcript.slice(0, 2).map((line, i) => (
                                                        <div key={i} className="flex gap-2">
                                                            <span className={`text-[10px] font-bold shrink-0 mt-0.5 ${line.speaker === 'AI' ? 'text-blue-500' : 'text-gray-500'}`}>{line.speaker}:</span>
                                                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{line.text}</p>
                                                        </div>
                                                    ))}
                                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50" />
                                                </div>
                                            )}
                                            <button onClick={() => { setTranscriptId(call.id); setModal('transcript'); }}
                                                className="mt-2.5 w-full py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                                                <BookOpen size={13} /> View Full Transcript
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <Phone size={36} className="text-gray-200 mx-auto mb-3" />
                                        <p className="text-sm">No calls recorded yet</p>
                                        <button onClick={() => openModal('call')} className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                                            Make a Call
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── WHATSAPP TAB ── */}
                    {activeTab === 'whatsapp' && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ minHeight: 420 }}>
                            <div className="bg-[#075E54] text-white p-4 flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold text-base shrink-0">{lead.name[0]}</div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm">{lead.name}</p>
                                    <p className="text-xs text-white/60">{lead.phone}</p>
                                </div>
                                <button onClick={() => openModal('whatsapp')}
                                    className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                                    <Send size={12} /> New Message
                                </button>
                            </div>
                            <div className="flex-1 bg-[#ECE5DD] p-4 overflow-y-auto min-h-[260px] flex flex-col gap-3">
                                {waHistory.length > 0 ? waHistory.map(msg => (
                                    <div key={msg.id} className={`max-w-[78%] ${msg.sender === 'AI' ? 'self-start' : 'self-end'}`}>
                                        <p className={`text-[10px] font-semibold mb-0.5 ${msg.sender === 'AI' ? 'text-indigo-600' : 'text-right text-green-700'}`}>
                                            {msg.sender === 'SalesRep' ? 'You' : msg.sender}
                                        </p>
                                        <div className={`p-2.5 rounded-xl shadow-sm text-sm ${msg.sender === 'AI' ? 'bg-white text-gray-800 rounded-tl-none' : 'bg-[#DCF8C6] text-gray-800 rounded-tr-none'}`}>
                                            {msg.attachment && (
                                                <div className="flex items-center gap-2 mb-2 bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg">
                                                    <FileText size={13} className="text-blue-500 shrink-0" />
                                                    <span className="text-xs font-semibold text-blue-700">{msg.attachment}</span>
                                                    <Download size={12} className="text-blue-400 ml-auto cursor-pointer" />
                                                </div>
                                            )}
                                            <p>{msg.text}</p>
                                            <p className="text-[10px] text-gray-400 text-right mt-0.5">{msg.time}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No messages yet</div>
                                )}
                            </div>
                            <div className="p-3 bg-gray-100 border-t border-gray-200 flex items-center gap-2">
                                <div className="flex-1 bg-white flex items-center rounded-full px-3 py-2 shadow-sm border border-gray-200">
                                    <input type="text" value={waText} onChange={e => setWaText(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && waText.trim()) sendAIAssistedWhatsApp(waText); }}
                                        placeholder="Type a reply..." className="flex-1 text-sm bg-transparent outline-none" />
                                </div>
                                <button onClick={() => sendAIAssistedWhatsApp(waText)}
                                    disabled={sendingWhatsApp}
                                    className="w-10 h-10 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-full flex items-center justify-center shadow-sm transition-colors">
                                    <Send size={15} className="ml-0.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── AI RECOMMENDATIONS ── */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <BrainCircuit size={16} className="text-blue-600" />
                            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide">AI Recommendations</h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                { title: 'High Intent Detected', desc: lead.insight || 'Customer is showing strong purchase signals.', action: 'Call Now', type: 'call', urgent: true },
                                { title: 'Send Price Sheet', desc: 'Customer enquired about pricing. Send detailed quote.', action: 'Send WhatsApp', type: 'whatsapp', urgent: false },
                                { title: 'Book Site Visit', desc: 'Right time to invite for a site visit or product demo.', action: 'Schedule', type: 'schedule', urgent: false },
                            ].map((rec, i) => (
                                <div key={i} className="bg-white border border-blue-100 rounded-xl p-4 flex gap-3 items-start hover:border-blue-200 transition-colors">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${rec.urgent ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {rec.urgent ? <Zap size={15} /> : <Info size={15} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900">{rec.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{rec.desc}</p>
                                    </div>
                                    <button onClick={() => openModal(rec.type)}
                                        className="shrink-0 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                                        {rec.action}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesLeadWorkspace;
