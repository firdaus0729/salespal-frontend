import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSales } from '../../context/SalesContext';
import {
    ArrowLeft, Phone, MessageSquare, Calendar, Edit3, TrendingUp,
    X, Check, Mic, Volume2, Send, FileText, Play, Pause, Download,
    BrainCircuit, Clock, Star, Activity, Users, ChevronRight,
    Zap, Target, Heart, BarChart3, BookOpen, CheckCircle,
    AlertCircle, Info, PlusCircle, RefreshCw, Award, Mail,
    MapPin, ExternalLink, PhoneOff, Coffee
} from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import {
    CALL_RESULT,
    CALL_RESULT_DETAIL,
    WHATSAPP_REPLY_STATE,
    WHATSAPP_NO_REPLY_DETAIL,
    VOICE_SILENCE_MS,
    WHATSAPP_SILENCE_MS,
    isWithinCallActiveWindow,
    callWindowLabel,
} from '../../utils/salesBotFlow';
import { speechRecognitionLangForLocale } from '../../utils/localeOptions';
import { playNotificationSound } from '../../utils/notificationSound';

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

/** Intent tier for playbook copy: matches dashboard intent (scoreLabel), else explicit pipeline status. */
function playbookIntentTier(scoreLabel, status) {
    const sl = String(scoreLabel || '').trim();
    if (sl === 'Hot' || sl === 'Warm' || sl === 'Cold') return sl;
    const st = String(status || '').trim();
    if (st === 'Hot' || st === 'Warm' || st === 'Cold') return st;
    return '';
}

/** Default Context / Recommendation when API has none — differs by Hot vs Warm vs Cold (product playbook). */
function aiPlaybookDefaults(scoreLabel, status) {
    const tier = playbookIntentTier(scoreLabel, status);
    if (tier === 'Hot') {
        return {
            context:
                'High-intent lead—use priority handling. Notify the assigned owner immediately, push for a call or meeting the same day, and confirm date and time. For a visit or in-person meeting, send the exact location or join link right away.',
            recommendation:
                'Same day: lock the slot, share location or calendar link, and keep the owner in the loop if anything slips.',
        };
    }
    if (tier === 'Warm') {
        return {
            context:
                'Warm lead—run the follow-up flow. Plan WhatsApp on day 1, 3, and 5 with reminders (same day +1 hour, +1 day). Call the next day around 11:00 or 18:30. If you convert to a meeting, track visit outcome: proceed when done, reschedule for the next day on no-show.',
            recommendation:
                'Turn interest into a concrete next step (time + channel) before intent cools; schedule the meeting and set visit status.',
        };
    }
    if (tier === 'Cold') {
        return {
            context:
                'Nurture segment—prioritise campaign flow over aggressive one-to-one chasing. Keep rhythm with a weekly campaign broadcast and only escalate when they reply or show stronger signals.',
            recommendation:
                'Keep this lead on the weekly broadcast list; avoid same-day hard pushes unless they engage.',
        };
    }
    return {
        context: 'AI is analysing lead behaviour.',
        recommendation: 'No recommendation yet.',
    };
}

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
/** Map WhatsApp UI history to OpenAI-style roles for /ai/chat */
function buildWhatsappChatHistory(history) {
    const out = [];
    for (const m of history || []) {
        const text = String(m?.text || '').trim();
        if (!text) continue;
        const role = m.sender === 'AI' ? 'assistant' : 'user';
        out.push({ role, content: text.slice(0, 8000) });
    }
    return out.slice(-40);
}

/** Mute AI TTS output without canceling (pause + volume). `utteranceRef` is { current: SpeechSynthesisUtterance | null } */
function applySpeakerOutputMuteState(muted, utteranceRef) {
    if (typeof window === 'undefined') return;
    const syn = window.speechSynthesis;
    if (!syn) return;
    const u = utteranceRef?.current;
    if (muted) {
        if (u && typeof u.volume === 'number') {
            u.volume = 0;
        }
        if (typeof syn.pause === 'function') {
            try {
                if (syn.speaking && !syn.paused) syn.pause();
            } catch (_) {
                /* ignore */
            }
        }
    } else {
        if (typeof syn.resume === 'function') {
            try {
                if (syn.paused) syn.resume();
            } catch (_) {
                /* ignore */
            }
        }
        if (u && typeof u.volume === 'number') {
            u.volume = 1;
        }
    }
}

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
    const location = useLocation();
    const {
        leads,
        updateLeadStatus,
        addActionToLead,
        refreshLeadActivities,
        assignLead,
        scheduleAutomationHandshake,
        getLeadAutomationJobs,
        updateAutomationJobStatus,
    } = useSales();
    const { showToast } = useToast();

    const lead = useMemo(() => leads.find(l => l.id === id), [leads, id]);
    const aiPlaybook = useMemo(
        () => aiPlaybookDefaults(lead?.scoreLabel, lead?.status),
        [lead?.scoreLabel, lead?.status, lead?.id]
    );

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
    const [automationJobs, setAutomationJobs] = useState([]);
    const [creatingAutomation, setCreatingAutomation] = useState(false);
    const [cancellingAutomationId, setCancellingAutomationId] = useState(null);
    const [incomingCallJob, setIncomingCallJob] = useState(null);
    const [incomingCallSecondsLeft, setIncomingCallSecondsLeft] = useState(0);
    const [startingLiveCall, setStartingLiveCall] = useState(false);
    const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [voiceSession, setVoiceSession] = useState(null);
    const speechRef = useRef(null);
    /** Live volume for current utterance (mute speaker must not cancel speech / onEnd) */
    const isSpeakerMutedRef = useRef(false);
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
    /** Mic only after AI finishes speaking (opener or reply); blocks talking over the lead */
    const voiceMicAllowedRef = useRef(false);
    const [voiceMicAllowed, setVoiceMicAllowed] = useState(false);
    /** True while waiting on /voice/session/turn or TTS for that turn */
    const aiVoiceBusyRef = useRef(false);
    const setAllowVoiceMic = (v) => {
        voiceMicAllowedRef.current = v;
        setVoiceMicAllowed(v);
    };
    const waMessagesEndRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [lastHeardText, setLastHeardText] = useState('');
    const [isProcessingTurn, setIsProcessingTurn] = useState(false);
    const [isWaAiTyping, setIsWaAiTyping] = useState(false);
    const [liveCallTranscript, setLiveCallTranscript] = useState([]);
    const waTypingTimeoutRef = useRef(null);
    const waNoReplyTimerRef = useRef(null);
    const callNoAnswerTimerRef = useRef(null);
    const hasLoggedVoiceConnectedRef = useRef(false);
    const isProcessingTurnRef = useRef(false);
    const callStartedAtRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordingChunksRef = useRef([]);
    const recordingStreamRef = useRef(null);
    const recordingUrlRef = useRef(null);
    const playingAudioRef = useRef(null);
    const callRingTimerRef = useRef(null);
    const incomingCallTimeoutRef = useRef(null);
    const activeIncomingCallJobIdRef = useRef(null);
    const seenDispatchedCallJobsRef = useRef(new Set());
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
            setAllowVoiceMic(false);
        }
        setModal(type);
        if (type !== 'call') {
            setIsCallActive(false);
        }
    };

    /** Open Call / WhatsApp / Schedule / Note when arriving from leads table (`navigate(..., { state: { openModal } })`) */
    useEffect(() => {
        const m = location.state?.openModal;
        if (!lead || !m) return;
        if (!['call', 'whatsapp', 'schedule', 'note'].includes(m)) return;
        openModal(m);
        navigate(`/sales/leads/${id}`, { replace: true, state: {} });
    }, [lead, id, navigate, location.state?.openModal]);

    const clearPendingListenRestart = () => {
        if (listenRestartTimeoutRef.current != null) {
            clearTimeout(listenRestartTimeoutRef.current);
            listenRestartTimeoutRef.current = null;
        }
    };

    const clearWaTypingTimer = () => {
        if (waTypingTimeoutRef.current != null) {
            clearTimeout(waTypingTimeoutRef.current);
            waTypingTimeoutRef.current = null;
        }
    };

    const clearWaNoReplyTimer = () => {
        if (waNoReplyTimerRef.current != null) {
            clearTimeout(waNoReplyTimerRef.current);
            waNoReplyTimerRef.current = null;
        }
    };

    const clearCallNoAnswerTimer = () => {
        if (callNoAnswerTimerRef.current != null) {
            clearTimeout(callNoAnswerTimerRef.current);
            callNoAnswerTimerRef.current = null;
        }
    };

    const clearIncomingCallTimeout = () => {
        if (incomingCallTimeoutRef.current != null) {
            clearInterval(incomingCallTimeoutRef.current);
            incomingCallTimeoutRef.current = null;
        }
    };

    const stopIncomingRing = () => {
        if (callRingTimerRef.current != null) {
            clearInterval(callRingTimerRef.current);
            callRingTimerRef.current = null;
        }
    };

    const startIncomingRing = () => {
        stopIncomingRing();
        playNotificationSound();
        callRingTimerRef.current = setInterval(() => {
            playNotificationSound();
        }, 2500);
    };

    const startIncomingCallCountdown = () => {
        clearIncomingCallTimeout();
        setIncomingCallSecondsLeft(30);
        incomingCallTimeoutRef.current = setInterval(() => {
            setIncomingCallSecondsLeft((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    clearIncomingCallTimeout();
                    stopIncomingRing();
                    if (incomingCallJob && !isCallActive) {
                        dismissIncomingCall('missed');
                    }
                    return 0;
                }
                return next;
            });
        }, 1000);
    };

    const dismissIncomingCall = async (kind = 'declined') => {
        const jobId = incomingCallJob?.id;
        stopIncomingRing();
        clearIncomingCallTimeout();
        setIncomingCallSecondsLeft(0);
        if (jobId) {
            try {
                await updateAutomationJobStatus(jobId, 'cancelled');
            } catch (_) {
                // non-blocking
            }
        }
        if (incomingCallJob) {
            if (kind === 'missed') {
                addActionToLead(
                    lead.id,
                    'call',
                    'Incoming scheduled call missed',
                    'Lead did not answer scheduled incoming bot call in time.',
                    { outcome: 'No Answer', duration: '0m 00s' }
                );
            } else {
                addActionToLead(
                    lead.id,
                    'call',
                    'Incoming scheduled call declined',
                    'User declined scheduled incoming bot call.',
                    { outcome: 'Declined', duration: '0m 00s' }
                );
            }
        }
        setIncomingCallJob(null);
        setModal(null);
    };

    const pushLiveTranscript = (speaker, text) => {
        const line = String(text || '').trim();
        if (!line) return;
        setLiveCallTranscript((prev) => [...prev, { speaker, text: line }]);
    };

    const startCallRecording = async () => {
        if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia || typeof window.MediaRecorder === 'undefined') {
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new window.MediaRecorder(stream);
            recordingChunksRef.current = [];
            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) recordingChunksRef.current.push(event.data);
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
            recordingStreamRef.current = stream;
        } catch (err) {
            showToast({
                title: 'Recording unavailable',
                description: err?.message || 'Microphone recording could not be started.',
                variant: 'warning',
            });
        }
    };

    const stopCallRecording = async () => {
        return new Promise((resolve) => {
            const recorder = mediaRecorderRef.current;
            if (!recorder) {
                resolve(recordingUrlRef.current || null);
                return;
            }

            const finalize = () => {
                try {
                    const blob = new Blob(recordingChunksRef.current || [], { type: 'audio/webm' });
                    const url = blob.size > 0 ? URL.createObjectURL(blob) : null;
                    recordingUrlRef.current = url;
                    resolve(url);
                } catch (_) {
                    resolve(null);
                }
            };

            recorder.onstop = finalize;
            try {
                recorder.stop();
            } catch (_) {
                finalize();
            }

            if (recordingStreamRef.current) {
                recordingStreamRef.current.getTracks().forEach((t) => t.stop());
                recordingStreamRef.current = null;
            }
            mediaRecorderRef.current = null;
        });
    };

    const handlePlayRecording = (call) => {
        if (!call?.recordingUrl) {
            setPlayingId(playingId === call.id ? null : call.id);
            return;
        }
        if (playingAudioRef.current && playingId === call.id) {
            playingAudioRef.current.pause();
            playingAudioRef.current = null;
            setPlayingId(null);
            return;
        }
        if (playingAudioRef.current) {
            playingAudioRef.current.pause();
            playingAudioRef.current = null;
        }
        const audio = new Audio(call.recordingUrl);
        playingAudioRef.current = audio;
        setPlayingId(call.id);
        audio.onended = () => {
            if (playingAudioRef.current === audio) playingAudioRef.current = null;
            setPlayingId(null);
        };
        audio.play().catch(() => setPlayingId(null));
    };

    const stopSpeaking = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        speechRef.current = null;
    };

    const speakText = (text, onEnd) => {
        if (callActiveRef.current) clearCallNoAnswerTimer();
        if (!text) {
            if (typeof onEnd === 'function') onEnd();
            return;
        }
        if (typeof window === 'undefined' || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') {
            if (typeof onEnd === 'function') onEnd();
            return;
        }
        stopSpeaking();
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = isSpeakerMutedRef.current ? 0 : 1;
        utterance.onstart = () => {
            applySpeakerOutputMuteState(isSpeakerMutedRef.current, speechRef);
        };
        utterance.onend = () => {
            speechRef.current = null;
            if (typeof onEnd === 'function') onEnd();
        };
        utterance.onerror = () => {
            speechRef.current = null;
            if (typeof onEnd === 'function') onEnd();
        };
        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const endLiveAICall = async (opts = {}) => {
        const reason = opts.reason || 'user_end';
        voiceSessionStartLockRef.current = false;
        lastVoiceDupRef.current = { text: '', at: 0 };
        aiVoiceBusyRef.current = false;
        setAllowVoiceMic(false);
        clearPendingListenRestart();
        clearCallNoAnswerTimer();
        hasLoggedVoiceConnectedRef.current = false;
        callActiveRef.current = false;
        setIsProcessingTurn(false);
        stopListening();
        stopSpeaking();
        setIsCallActive(false);
        setVoiceSession(null);
        const recordingUrl = await stopCallRecording();
        const startedAt = callStartedAtRef.current || Date.now();
        const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        const mm = Math.floor(seconds / 60);
        const ss = String(seconds % 60).padStart(2, '0');
        const duration = `${mm}m ${ss}s`;

        let actionTitle = 'AI Voice Call Completed';
        let detailText = 'Call ended by user.';
        let outcomeLabel = 'Completed';
        if (reason === 'no_answer') {
            actionTitle = `Call result: ${CALL_RESULT.NO_ANSWER}`;
            detailText = CALL_RESULT_DETAIL[CALL_RESULT.NO_ANSWER];
            outcomeLabel = CALL_RESULT.NO_ANSWER;
        } else if (reason === 'busy') {
            actionTitle = `Call result: ${CALL_RESULT.BUSY}`;
            detailText = CALL_RESULT_DETAIL[CALL_RESULT.BUSY];
            outcomeLabel = CALL_RESULT.BUSY;
        } else if (reason === 'wrong_number') {
            actionTitle = `Call result: ${CALL_RESULT.WRONG_NUMBER}`;
            detailText = CALL_RESULT_DETAIL[CALL_RESULT.WRONG_NUMBER];
            outcomeLabel = CALL_RESULT.WRONG_NUMBER;
        }

        addActionToLead(lead.id, 'call', actionTitle, detailText, {
            outcome: outcomeLabel,
            duration,
            recording: recordingUrl ? `Call_${String(lead.id).slice(0, 6)}_${Date.now()}.webm` : null,
            recordingUrl,
            transcript: liveCallTranscript,
        });
        setLiveCallTranscript([]);
        callStartedAtRef.current = null;
        const activeIncomingJobId = activeIncomingCallJobIdRef.current;
        if (activeIncomingJobId) {
            try {
                await updateAutomationJobStatus(activeIncomingJobId, 'completed');
            } catch (_) {
                // non-blocking
            }
            activeIncomingCallJobIdRef.current = null;
        }
        clearIncomingCallTimeout();
        setIncomingCallSecondsLeft(0);
        setIncomingCallJob(null);
        setModal(null);
    };

    const scheduleCallNoAnswerTimer = () => {
        clearCallNoAnswerTimer();
        if (!callActiveRef.current || micMutedRef.current) return;
        callNoAnswerTimerRef.current = setTimeout(() => {
            callNoAnswerTimerRef.current = null;
            if (!callActiveRef.current) return;
            endLiveAICall({ reason: 'no_answer' });
        }, VOICE_SILENCE_MS);
    };

    const scheduleWaNoReplyTimer = () => {
        clearWaNoReplyTimer();
        if (!lead?.id) return;
        waNoReplyTimerRef.current = setTimeout(() => {
            waNoReplyTimerRef.current = null;
            addActionToLead(
                lead.id,
                'ai_action',
                `WhatsApp user reply: ${WHATSAPP_REPLY_STATE.NO} (30s)`,
                WHATSAPP_NO_REPLY_DETAIL,
                {}
            );
            showToast({
                title: 'No reply from lead',
                description: WHATSAPP_NO_REPLY_DETAIL,
                variant: 'default',
            });
        }, WHATSAPP_SILENCE_MS);
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
        if (micMutedRef.current) return;
        const now = Date.now();
        if (text === lastVoiceDupRef.current.text && now - lastVoiceDupRef.current.at < 1200) {
            return;
        }
        lastVoiceDupRef.current = { text, at: now };

        clearCallNoAnswerTimer();
        if (!hasLoggedVoiceConnectedRef.current) {
            hasLoggedVoiceConnectedRef.current = true;
            addActionToLead(
                lead.id,
                'ai_action',
                `Call result: ${CALL_RESULT.CONNECTED}`,
                CALL_RESULT_DETAIL[CALL_RESULT.CONNECTED],
                {}
            );
        }

        aiVoiceBusyRef.current = true;
        setAllowVoiceMic(false);
        stopListening();
        setIsProcessingTurn(true);
        try {
            addActionToLead(lead.id, 'call', 'Lead Spoke', text, { outcome: 'In conversation' });
            pushLiveTranscript('Lead', text);
            const turn = await api.post('/ai/voice/session/turn', {
                brandId: voiceSession.brandId,
                leadId: voiceSession.leadId,
                conversationId: voiceSession.conversationId,
                text,
            });

            const reply = turn?.assistant_reply ? String(turn.assistant_reply).trim() : '';
            if (reply && callActiveRef.current) {
                addActionToLead(lead.id, 'call', 'AI Voice Reply', reply, { outcome: 'Responded' });
                pushLiveTranscript('AI', reply);
                speakText(reply, () => {
                    aiVoiceBusyRef.current = false;
                    if (callActiveRef.current) {
                        setAllowVoiceMic(true);
                        scheduleCallNoAnswerTimer();
                    }
                    setIsProcessingTurn(false);
                });
            } else {
                aiVoiceBusyRef.current = false;
                if (callActiveRef.current) setAllowVoiceMic(true);
                setIsProcessingTurn(false);
            }
        } catch (err) {
            aiVoiceBusyRef.current = false;
            if (callActiveRef.current) setAllowVoiceMic(true);
            setIsProcessingTurn(false);
            addActionToLead(lead.id, 'call', 'AI Voice Turn Failed', err?.message || 'Could not process voice turn.');
            showToast({
                title: 'Voice turn failed',
                description: err?.message || 'Could not process your speech input.',
                variant: 'error',
            });
        }
    };

    const startListening = async () => {
        if (isMicMuted || !callActiveRef.current || !voiceMicAllowedRef.current) return;
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
            recognition.lang = speechRecognitionLangForLocale(lead?.preferredLocale || 'en');
            recognition.interimResults = false;
            recognition.continuous = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = async (event) => {
                if (micMutedRef.current) return;
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
                if (!voiceMicAllowedRef.current || aiVoiceBusyRef.current) return;
                clearPendingListenRestart();
                listenRestartTimeoutRef.current = setTimeout(() => {
                    listenRestartTimeoutRef.current = null;
                    if (
                        callActiveRef.current &&
                        !micMutedRef.current &&
                        voiceMicAllowedRef.current &&
                        !aiVoiceBusyRef.current
                    ) {
                        startListening();
                    }
                }, 350);
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
        if (!isWithinCallActiveWindow(lead.timezone)) {
            showToast({
                title: 'Outside calling hours',
                description: callWindowLabel(lead.timezone),
                variant: 'warning',
            });
            return;
        }
        voiceSessionStartLockRef.current = true;
        voiceCallDismissedRef.current = false;
        primeSpeechSynthesisFromUserGesture();
        setStartingLiveCall(true);
        try {
            const waCommLocal = (lead.communications || []).find((c) => c.type === 'whatsapp');
            const history = (waCommLocal?.history || []).slice(-8);
            const openerContext = history.map((m) => `${m.sender}: ${m.text}`).join('\n');
            const response = await api.post('/ai/voice/session/start', {
                leadId: lead.id,
                phone: lead.phone,
                name: lead.name,
                locale: lead.preferredLocale || 'hing',
                openerContext,
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
            hasLoggedVoiceConnectedRef.current = false;
            setLiveCallTranscript([]);
            callStartedAtRef.current = Date.now();
            recordingUrlRef.current = null;
            await startCallRecording();
            stopIncomingRing();
            clearIncomingCallTimeout();
            setIncomingCallSecondsLeft(0);
            if (incomingCallJob?.id) {
                activeIncomingCallJobIdRef.current = incomingCallJob.id;
                try {
                    await updateAutomationJobStatus(incomingCallJob.id, 'completed');
                } catch (_) {
                    // non-blocking
                }
            } else {
                activeIncomingCallJobIdRef.current = null;
            }
            setIncomingCallJob(null);
            setAllowVoiceMic(false);
            const opener = response?.assistant_reply ? String(response.assistant_reply).trim() : '';
            if (opener) {
                pushLiveTranscript('AI', opener);
                speakText(opener, () => {
                    if (callActiveRef.current && !voiceCallDismissedRef.current) {
                        setAllowVoiceMic(true);
                        scheduleCallNoAnswerTimer();
                    }
                });
            } else {
                setAllowVoiceMic(true);
                scheduleCallNoAnswerTimer();
            }
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

    const sendAIAssistedWhatsApp = async (rawText) => {
        const text = String(rawText || '').trim();
        if (!text) return;
        clearWaNoReplyTimer();
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
            const waCommLocal = (lead.communications || []).find(c => c.type === 'whatsapp');
            const priorHistory = buildWhatsappChatHistory(waCommLocal?.history || []);
            addActionToLead(lead.id, 'whatsapp', 'WhatsApp sent', text, { sender: 'SalesRep' });
            const ai = await api.post('/ai/chat', {
                context: 'whatsapp',
                history: priorHistory,
                leadPreferredLocale: lead.preferredLocale || 'hing',
                leadTimezone: lead.timezone || undefined,
                message: `Lead name: ${lead.name}\n\nTheir latest message (your reply must be ONLY in the same language(s) and script they used — any language worldwide; mirror them exactly, do not switch to English or another language):\n${text}\n\nWrite one concise WhatsApp reply as the sales rep (no email-style sign-off). One message only.`,
            });
            const aiReply = ai?.response ? sanitizeWhatsappAiReply(ai.response) : null;
            if (aiReply) {
                setIsWaAiTyping(true);
                clearWaTypingTimer();
                const delay = Math.min(7000, Math.max(900, aiReply.length * 22));
                waTypingTimeoutRef.current = setTimeout(() => {
                    addActionToLead(lead.id, 'whatsapp', 'AI WhatsApp follow-up', aiReply, { sender: 'AI' });
                    setIsWaAiTyping(false);
                    waTypingTimeoutRef.current = null;
                    scheduleWaNoReplyTimer();
                }, delay);
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
            setIsWaAiTyping(true);
            clearWaTypingTimer();
            waTypingTimeoutRef.current = setTimeout(() => {
                addActionToLead(lead.id, 'whatsapp', 'AI WhatsApp follow-up', fallbackReply, { sender: 'AI' });
                setIsWaAiTyping(false);
                waTypingTimeoutRef.current = null;
                scheduleWaNoReplyTimer();
            }, Math.min(4000, Math.max(900, fallbackReply.length * 20)));
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
        isSpeakerMutedRef.current = isSpeakerMuted;
        applySpeakerOutputMuteState(isSpeakerMuted, speechRef);
    }, [isSpeakerMuted]);

    useEffect(() => {
        isProcessingTurnRef.current = isProcessingTurn;
    }, [isProcessingTurn]);

    useEffect(() => {
        if (isMicMuted) clearCallNoAnswerTimer();
    }, [isMicMuted]);

    useEffect(() => {
        if (modal !== 'whatsapp') clearWaNoReplyTimer();
    }, [modal]);

    useEffect(() => {
        if (isCallActive || modal !== 'call') {
            stopIncomingRing();
        }
    }, [isCallActive, modal]);

    useEffect(() => {
        return () => {
            clearWaTypingTimer();
            clearCallNoAnswerTimer();
            clearWaNoReplyTimer();
            stopIncomingRing();
            stopListening();
            stopSpeaking();
            if (playingAudioRef.current) {
                playingAudioRef.current.pause();
                playingAudioRef.current = null;
            }
            if (recordingStreamRef.current) {
                recordingStreamRef.current.getTracks().forEach((t) => t.stop());
                recordingStreamRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!lead?.id) return;
        refreshLeadActivities(lead.id);
    }, [lead?.id, refreshLeadActivities]);

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
        if (isMicMuted) stopListening();
    }, [isMicMuted]);

    useEffect(() => {
        if (!isCallActive || isMicMuted || !voiceMicAllowed) {
            stopListening();
            return;
        }
        startListening();
    }, [isCallActive, isMicMuted, voiceMicAllowed]);

    useLayoutEffect(() => {
        if (modal !== 'whatsapp' || !lead) return;
        waMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [modal, lead, sendingWhatsApp, isWaAiTyping]);

    useEffect(() => {
        if (!lead?.id) return;
        let mounted = true;
        const loadJobs = async () => {
            try {
                const rows = await getLeadAutomationJobs(lead.id);
                if (!mounted) return;
                const list = Array.isArray(rows) ? rows : [];
                setAutomationJobs(list);
                const dueCall = list.find(
                    (j) =>
                        j.status === 'dispatched' &&
                        j.target_channel === 'call' &&
                        !seenDispatchedCallJobsRef.current.has(j.id)
                );
                if (dueCall && !isCallActive && !startingLiveCall) {
                    seenDispatchedCallJobsRef.current.add(dueCall.id);
                    setIncomingCallJob(dueCall);
                    startIncomingRing();
                    startIncomingCallCountdown();
                    showToast({
                        title: 'Incoming scheduled bot call',
                        description: 'Call time reached. Tap the green button to let the bot start speaking.',
                        variant: 'info',
                    });
                }
            } catch (_) {
                if (!mounted) return;
                setAutomationJobs([]);
            }
        };
        loadJobs();
        const interval = setInterval(loadJobs, 30000);
        return () => {
            mounted = false;
            clearInterval(interval);
            stopIncomingRing();
            clearIncomingCallTimeout();
        };
    }, [lead?.id, getLeadAutomationJobs, isCallActive, startingLiveCall]);

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
    const callAllowedNow = isWithinCallActiveWindow(lead.timezone);

    /* ── Score colour helpers ── */
    const scoreColor = (s) => s >= 80 ? 'text-red-600' : s >= 50 ? 'text-orange-500' : 'text-sky-500';
    const scoreBar = (s) => s >= 80 ? 'bg-red-500' : s >= 50 ? 'bg-orange-400' : 'bg-sky-400';
    const pendingAutomationJobs = automationJobs.filter((j) => j.status === 'pending');

    const scheduleHandshake = async ({ sourceChannel, targetChannel, when, messageTemplate }) => {
        if (!lead?.id) return;
        try {
            setCreatingAutomation(true);
            const job = await scheduleAutomationHandshake(lead.id, {
                sourceChannel,
                targetChannel,
                scheduleAt: when,
                payload: {
                    messageTemplate: messageTemplate || '',
                    leadName: lead.name,
                },
            });
            if (job?.id) {
                setAutomationJobs((prev) => [job, ...prev]);
            } else {
                const refreshed = await getLeadAutomationJobs(lead.id);
                setAutomationJobs(Array.isArray(refreshed) ? refreshed : []);
            }
            showToast({
                title: 'Automation scheduled',
                description: `Bot will continue on ${targetChannel} at ${new Date(when).toLocaleString()}.`,
                variant: 'success',
            });
        } catch (err) {
            showToast({
                title: 'Could not schedule automation',
                description: err?.message || 'Please try again.',
                variant: 'warning',
            });
        } finally {
            setCreatingAutomation(false);
        }
    };

    const cancelBookedCallReservation = async (job) => {
        if (!job?.id || !lead?.id) return;
        try {
            setCancellingAutomationId(job.id);
            await updateAutomationJobStatus(job.id, 'cancelled');
            setAutomationJobs((prev) => prev.map((row) => (row.id === job.id ? { ...row, status: 'cancelled' } : row)));
            if (incomingCallJob?.id === job.id) {
                setIncomingCallJob(null);
                stopIncomingRing();
                clearIncomingCallTimeout();
                setIncomingCallSecondsLeft(0);
            }
            showToast({
                title: 'Call reservation cancelled',
                description: 'The bot will not call at the scheduled time.',
                variant: 'success',
            });
        } catch (err) {
            showToast({
                title: 'Could not cancel reservation',
                description: err?.message || 'Please try again.',
                variant: 'warning',
            });
        } finally {
            setCancellingAutomationId(null);
        }
    };

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
                                {!callAllowedNow && !isCallActive && (
                                    <div className="mx-4 mt-4 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-100 text-xs px-3 py-2 text-left leading-snug">
                                        Calls are only active 9:00 AM – 9:00 PM in the lead&apos;s timezone. {callWindowLabel(lead.timezone)}
                                    </div>
                                )}
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
                                    <p className="text-blue-200/70 text-[10px] mt-1 px-2 max-w-xs">{callWindowLabel(lead.timezone)}</p>
                                    <div className="flex items-center gap-2 mt-6 bg-white/10 border border-white/10 px-4 py-2 rounded-full text-emerald-300 text-sm font-semibold max-w-[90%] flex-wrap justify-center">
                                        <span
                                            className={`w-2 h-2 rounded-full shrink-0 ${startingLiveCall ? 'bg-amber-400 animate-pulse' : isCallActive ? 'bg-emerald-400' : 'bg-slate-300'}`}
                                        />
                                        {startingLiveCall
                                            ? 'Connecting…'
                                            : isCallActive
                                              ? isProcessingTurn
                                                  ? 'Processing your speech…'
                                                  : !voiceMicAllowed
                                                    ? 'AI is speaking…'
                                                    : isListening
                                                      ? 'Listening — speak after the AI finishes'
                                                      : 'Mic ready'
                                              : incomingCallJob
                                                ? 'Incoming scheduled call — tap green button to answer'
                                                : 'Ready — tap the green button to start'}
                                    </div>
                                    {!isCallActive && incomingCallJob && (
                                        <div className="mt-3 text-[11px] text-amber-100 bg-amber-500/20 border border-amber-300/40 rounded px-3 py-1.5">
                                            Scheduled time reached: {new Date(incomingCallJob.schedule_at).toLocaleString()}.
                                            {incomingCallSecondsLeft > 0 ? ` Answer in ${incomingCallSecondsLeft}s` : ''}
                                        </div>
                                    )}
                                    {isCallActive && lastHeardText ? (
                                        <div className="mt-3 text-xs text-blue-100/90">Heard: “{lastHeardText}”</div>
                                    ) : null}
                                    <div className="mt-4 w-full max-w-sm bg-white/10 border border-white/10 rounded-xl p-3 max-h-36 overflow-y-auto">
                                        {liveCallTranscript.length > 0 ? liveCallTranscript.slice(-8).map((line, idx) => (
                                            <div key={`${line.speaker}-${idx}`} className="text-xs text-left mb-1.5 last:mb-0">
                                                <span className="font-bold text-white/90">{line.speaker}:</span>{' '}
                                                <span className="text-blue-100/95">{line.text}</span>
                                            </div>
                                        )) : (
                                            <p className="text-xs text-blue-100/80">Live call history appears here.</p>
                                        )}
                                    </div>
                                    {isCallActive && (
                                        <div className="mt-4 flex flex-wrap gap-2 justify-center w-full max-w-sm">
                                            <button
                                                type="button"
                                                onClick={() => endLiveAICall({ reason: 'busy' })}
                                                disabled={!voiceMicAllowed || isProcessingTurn}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/15 border border-white/20 hover:bg-white/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                title="Lead is busy — Retry next slot"
                                            >
                                                <Coffee size={14} /> Busy
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => endLiveAICall({ reason: 'wrong_number' })}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/15 border border-white/20 hover:bg-white/25 transition-colors"
                                                title="Wrong number — stop call"
                                            >
                                                <PhoneOff size={14} /> Wrong number
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-center gap-6 pb-10">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isCallActive) return;
                                            setIsMicMuted((prev) => {
                                                const next = !prev;
                                                micMutedRef.current = next;
                                                if (next) {
                                                    queueMicrotask(() => stopListening());
                                                }
                                                return next;
                                            });
                                        }}
                                        disabled={!isCallActive}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${!isCallActive ? 'opacity-40 cursor-not-allowed' : ''} ${isMicMuted ? 'bg-red-500/80 text-white' : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'}`}
                                        title={isMicMuted ? 'Unmute microphone — AI will hear you again' : 'Mute microphone — AI will not pick up your voice'}
                                    >
                                        <Mic size={22} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={isCallActive ? () => endLiveAICall() : startLiveAICall}
                                        disabled={startingLiveCall || (!isCallActive && !callAllowedNow)}
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
                                        onClick={() => {
                                            if (!isCallActive) return;
                                            setIsSpeakerMuted((prev) => {
                                                const next = !prev;
                                                isSpeakerMutedRef.current = next;
                                                queueMicrotask(() => applySpeakerOutputMuteState(next, speechRef));
                                                return next;
                                            });
                                        }}
                                        disabled={!isCallActive}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${!isCallActive ? 'opacity-40 cursor-not-allowed' : ''} ${isSpeakerMuted ? 'bg-red-500/80 text-white' : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'}`}
                                        title={isSpeakerMuted ? 'Unmute speaker — hear the AI again' : 'Mute speaker — silence AI audio (call continues)'}
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
                            <div className="flex flex-col max-h-[min(90dvh,720px)] min-h-0" style={{ minHeight: 400 }}>
                                <div className="bg-[#075E54] text-white p-4 flex items-center gap-3 shrink-0">
                                    <button type="button" onClick={() => setModal(null)} className="text-white/70 hover:text-white"><X size={20} /></button>
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg shrink-0">{lead.name[0]}</div>
                                    <div>
                                        <p className="font-bold text-sm">{lead.name}</p>
                                        <p className="text-xs text-white/60">{lead.phone} · Active 24/7</p>
                                    </div>
                                </div>
                                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[#ECE5DD] p-4 flex flex-col gap-2">
                                    {waHistory.length > 0 ? waHistory.map(msg => (
                                        <div key={msg.id} className={`max-w-[80%] ${msg.sender === 'AI' ? 'self-start bg-white rounded-tl-none' : 'self-end bg-[#DCF8C6] rounded-tr-none'} p-2.5 rounded-xl shadow-sm text-sm text-gray-800`}>
                                            {msg.attachment && <p className="text-xs font-semibold text-blue-600 mb-1">📎 {msg.attachment}</p>}
                                            <p>{msg.text}</p>
                                            <p className="text-[10px] text-gray-400 text-right mt-0.5">{msg.time}</p>
                                        </div>
                                    )) : (
                                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm min-h-[120px]">Start a new conversation</div>
                                    )}
                                    {isWaAiTyping && (
                                        <div className="max-w-[80%] self-start bg-white rounded-tl-none p-2.5 rounded-xl shadow-sm text-sm text-gray-700 border border-gray-100">
                                            <p className="text-[11px] text-gray-500">SalesPal team is writing...</p>
                                        </div>
                                    )}
                                    <div ref={waMessagesEndRef} className="h-px w-full shrink-0" aria-hidden />
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

    const renderIncomingCallOverlay = () => {
        if (!incomingCallJob || isCallActive || startingLiveCall) return null;
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[95] bg-gray-950/85 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.96, y: 12, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.96, y: 12, opacity: 0 }}
                        className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-blue-900 to-blue-950 text-white p-7 shadow-2xl text-center"
                    >
                        <div className="w-24 h-24 rounded-full mx-auto bg-white/10 flex items-center justify-center relative mb-5">
                            <div className="absolute inset-0 rounded-full border-4 border-emerald-400/40 animate-ping" />
                            <Phone size={34} />
                        </div>
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-200 font-semibold">Incoming Scheduled Bot Call</p>
                        <h3 className="mt-2 text-2xl font-bold">{lead.name}</h3>
                        <p className="text-blue-200 text-sm mt-1">{lead.phone}</p>
                        <p className="text-blue-100/90 text-xs mt-3">
                            Scheduled time reached: {new Date(incomingCallJob.schedule_at).toLocaleString()}
                        </p>
                        <p className="text-amber-200 text-xs mt-1">Answer in {Math.max(0, incomingCallSecondsLeft)}s</p>

                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => dismissIncomingCall('declined')}
                                className="w-full py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold"
                            >
                                Decline
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    openModal('call');
                                    startLiveAICall();
                                }}
                                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold"
                            >
                                Accept
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    };

    /* ──────────────────────── RENDER ──────────────────────────── */
    return (
        <div className="font-sans text-gray-900 pb-16">
            {renderModal()}
            {renderIncomingCallOverlay()}

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

            <SectionCard title="Bot Call-Chat Handshake" icon={RefreshCw} iconColor="text-indigo-600" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => scheduleHandshake({
                            sourceChannel: 'whatsapp',
                            targetChannel: 'call',
                            when: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                        })}
                        disabled={creatingAutomation}
                        className="px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 disabled:opacity-60"
                    >
                        Chat → Call in 1 hour
                    </button>
                    <button
                        type="button"
                        onClick={() => scheduleHandshake({
                            sourceChannel: 'call',
                            targetChannel: 'whatsapp',
                            when: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
                            messageTemplate: `Hi ${lead.name.split(' ')[0]}, continuing from our call. Let's continue here.`,
                        })}
                        disabled={creatingAutomation}
                        className="px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-60"
                    >
                        Call → Chat in 5 min
                    </button>
                    <button
                        type="button"
                        onClick={() => scheduleHandshake({
                            sourceChannel: 'whatsapp',
                            targetChannel: 'call',
                            when: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        })}
                        disabled={creatingAutomation}
                        className="px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 disabled:opacity-60"
                    >
                        Schedule call tomorrow
                    </button>
                </div>
                <div className="mt-3">
                    {pendingAutomationJobs.length > 0 ? (
                        <div className="space-y-1.5">
                            {pendingAutomationJobs.slice(0, 4).map((job) => (
                                <div key={job.id} className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 flex items-center justify-between gap-2">
                                    <span className="truncate">
                                        {job.source_channel} → {job.target_channel} at {new Date(job.schedule_at).toLocaleString()}
                                    </span>
                                    {job.target_channel === 'call' ? (
                                        <button
                                            type="button"
                                            onClick={() => cancelBookedCallReservation(job)}
                                            disabled={cancellingAutomationId === job.id}
                                            className="shrink-0 px-2 py-1 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
                                        >
                                            {cancellingAutomationId === job.id ? 'Cancelling…' : 'Cancel'}
                                        </button>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">No pending bot automation jobs for this lead.</p>
                    )}
                </div>
            </SectionCard>

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
                                <p className="text-sm text-blue-900 leading-relaxed">{lead.insight || aiPlaybook.context}</p>
                            </div>
                            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide mb-1">Recommendation</p>
                                <p className="text-sm text-purple-900 leading-relaxed">{lead.recommendation || aiPlaybook.recommendation}</p>
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
                                                <button onClick={() => handlePlayRecording(call)}
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
                                                <button
                                                    onClick={() => {
                                                        if (!call.recordingUrl) return;
                                                        const a = document.createElement('a');
                                                        a.href = call.recordingUrl;
                                                        a.download = call.recording || `call_recording_${call.id}.webm`;
                                                        a.click();
                                                    }}
                                                    className="p-1.5 text-indigo-500 hover:text-indigo-700 rounded hover:bg-indigo-100 transition-colors"
                                                >
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
                                {isWaAiTyping && (
                                    <div className="max-w-[78%] self-start">
                                        <p className="text-[10px] font-semibold mb-0.5 text-indigo-600">AI</p>
                                        <div className="p-2.5 rounded-xl shadow-sm text-sm bg-white text-gray-700 rounded-tl-none border border-gray-100">
                                            SalesPal team is writing...
                                        </div>
                                    </div>
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
