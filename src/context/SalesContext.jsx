import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';
import { DEFAULT_PREFERRED_LOCALE } from '../utils/localeOptions';
import {
    buildLeadActionPayload,
    hydrateLeadStateFromActions,
    isPersistableLeadId,
} from '../utils/salesActivityHydrate';

const SalesContext = createContext(null);

export const useSales = () => {
    const context = useContext(SalesContext);
    if (!context) {
        throw new Error('useSales must be used within a SalesProvider');
    }
    return context;
};

const initialLeads = [
    {
        id: '1',
        name: 'Priya Sharma',
        phone: '98xxxx',
        preferredLocale: 'hing',
        timezone: 'Asia/Kolkata',
        source: 'Meta Ads',
        project: 'Real Estate',
        campaign: 'Summer Sale 2026',
        status: 'Hot',
        aiScore: 95,
        dealProbability: 88,
        scoreLabel: 'Hot',
        lastInteraction: 'ready for site visit',
        assignedTo: 'John Doe',
        createdDate: new Date().toISOString(),
        insight: 'Customer requested site visit. High purchase intent detected.',
        recommendation: 'Call within 30 minutes to confirm site visit time.',
        timeline: [
            { id: 101, type: 'capture', action: 'Lead Captured', time: 'Yesterday, 04:10 PM', detail: 'Source: Meta Ads' },
            { id: 102, type: 'ai_action', action: 'Lead scored hot', time: 'Yesterday, 04:11 PM', detail: 'Assigned 95% intent score based on form answers.' },
            { id: 103, type: 'call', action: 'Call attempted', time: 'Yesterday, 04:15 PM', detail: 'AI Initial Qualification Call' },
            { id: 104, type: 'whatsapp', action: 'WhatsApp brochure sent', time: 'Today, 10:30 AM', detail: 'Automated Real Estate Brochure Delivery' },
            { id: 105, type: 'meeting', action: 'Meeting scheduled', time: 'Today, 02:00 PM', detail: 'Site visit confirmed by Lead.' }
        ],
        communications: [
            {
                id: 201, type: 'call',
                time: 'Yesterday, 04:15 PM',
                duration: '2m 14s',
                outcome: 'Qualified',
                recording: 'Recording_0415.mp3',
                sentiment: 92,
                transcript: [
                    { speaker: 'AI', text: 'Hi Priya, this is Alex from SalesPal. I see you downloaded our property brochure. How can I help?' },
                    { speaker: 'Lead', text: 'Yes, I was looking at the 3BHK options and I wanted to schedule a site visit.' },
                    { speaker: 'AI', text: 'Absolutely! I can arrange that. What day works best for you?' }
                ]
            },
            {
                id: 202, type: 'whatsapp',
                history: [
                    { id: 301, sender: 'AI', text: 'Hi Priya, here is the detailed brochure you requested! Let me know if you would like me to book a site visit. 🏡', time: '10:30 AM', attachment: 'Brochure_3BHK.pdf' },
                    { id: 302, sender: 'Lead', text: 'Thanks. Can I come tomorrow at 4 PM?', time: '01:45 PM' },
                    { id: 303, sender: 'AI', text: 'Absolutely. I have scheduled your visit for tomorrow at 4:00 PM. Our team will meet you at the site.', time: '02:00 PM' }
                ]
            }
        ],
        followups: [
            { id: 401, task: 'Send site location pin', status: 'Pending', time: 'Tomorrow, 10:00 AM' }
        ]
    },
    {
        id: '2',
        name: 'Rahul Kumar',
        phone: '99xxxx',
        preferredLocale: 'hing',
        timezone: 'Asia/Kolkata',
        source: 'Google Ads',
        project: 'Coaching',
        campaign: 'Winter Special',
        status: 'Warm',
        aiScore: 72,
        dealProbability: 45,
        scoreLabel: 'Warm',
        lastInteraction: 'requested pricing',
        assignedTo: 'Jane Smith',
        createdDate: new Date(Date.now() - 86400000).toISOString(),
        insight: 'Customer asked for pricing but is hesitant. Medium intent detected.',
        recommendation: 'Recommend sending price sheet and case studies.',
        timeline: [
            { id: 106, type: 'capture', action: 'Lead Captured', time: '2 Days Ago', detail: 'Source: Google Ads' },
            { id: 107, type: 'call', action: 'Call attempted', time: 'Yesterday, 11:00 AM', detail: 'No answer.' },
            { id: 108, type: 'whatsapp', action: 'Pricing request received', time: 'Today, 09:15 AM', detail: 'Client asked for coaching packages.' }
        ],
        communications: [
            {
                id: 203, type: 'call',
                time: 'Yesterday, 11:00 AM',
                duration: '0m 15s',
                outcome: 'No Answer',
                recording: 'Recording_1100.mp3',
                sentiment: 0,
                transcript: [
                    { speaker: 'AI', text: 'Ringing...' },
                    { speaker: 'System', text: 'Call forwarded to voicemail.' }
                ]
            },
            {
                id: 204, type: 'whatsapp',
                history: [
                    { id: 304, sender: 'AI', text: 'Hi Rahul, thanks for your interest in our Coaching program! Let me know if we can hop on a quick call.', time: 'Yesterday, 11:05 AM' },
                    { id: 305, sender: 'Lead', text: 'I am busy. Can you just share the pricing?', time: 'Today, 09:15 AM' }
                ]
            }
        ],
        followups: [
            { id: 402, task: 'Follow-up on pricing email', status: 'Pending', time: 'Tomorrow, 02:00 PM' }
        ]
    }
];

const stageToUiStatus = (stage) => {
    const value = String(stage || '').toLowerCase();
    if (value === 'contacted') return 'Contacted';
    if (value === 'qualified') return 'Warm';
    if (value === 'proposal') return 'Hot';
    if (value === 'closed_won') return 'Converted';
    if (value === 'closed_lost') return 'Lost';
    return 'New';
};

const uiStatusToStage = (status) => {
    const value = String(status || '').toLowerCase();
    if (value === 'contacted') return 'contacted';
    if (value === 'warm') return 'qualified';
    if (value === 'hot') return 'proposal';
    if (value === 'converted' || value === 'won') return 'closed_won';
    if (value === 'lost' || value === 'closed') return 'closed_lost';
    return 'new';
};

const priorityToScore = (priority, fallbackScore) => {
    if (typeof fallbackScore === 'number') return fallbackScore;
    const value = String(priority || '').toLowerCase();
    if (value === 'high') return 85;
    if (value === 'medium') return 60;
    return 35;
};

/** Intent tile (Hot / Warm / Cold): explicit pipeline Hot/Warm wins; else use AI score bands like the dashboard. */
const intentLabelFromStatusAndScore = (status, aiScore) => {
    if (status === 'Hot' || status === 'Warm') return status;
    const n = typeof aiScore === 'number' && !Number.isNaN(aiScore) ? aiScore : 0;
    if (n >= 80) return 'Hot';
    if (n >= 50) return 'Warm';
    return 'Cold';
};

const normalizePhone = (phone) => String(phone || '').replace(/[^\d+]/g, '').trim();
const isValidPhone = (phone) => /^\d{7,15}$/.test(normalizePhone(phone).replace(/^\+/, ''));
const isValidEmail = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

const mapLeadRecord = (lead) => {
    const firstName = (lead.contact_first_name || '').trim();
    const lastName = (lead.contact_last_name || '').trim();
    const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Contact';
    const status = stageToUiStatus(lead.stage);
    const aiScore = priorityToScore(lead.priority, lead.ai_score);
    const metadata = lead.metadata || {};

    return {
        id: lead.id,
        name: fullName,
        phone: lead.contact_phone || 'No phone',
        email: lead.contact_email || '',
        source: lead.source || metadata.source || 'Manual',
        project: metadata.projectName || 'Default Project',
        campaign: metadata.campaignName || lead.company_name || 'General Lead',
        status,
        aiScore,
        dealProbability: typeof lead.value === 'number' && lead.value > 0 ? 80 : 30,
        scoreLabel: intentLabelFromStatusAndScore(status, aiScore),
        lastInteraction: metadata.lastInteraction || 'Lead created',
        assignedTo: lead.assigned_to || 'Unassigned',
        createdDate: lead.created_at || new Date().toISOString(),
        timezone: metadata.timezone || null,
        preferredLocale: metadata.preferredLocale || DEFAULT_PREFERRED_LOCALE,
        rawDeal: lead,
        timeline: [],
        communications: [],
        followups: [],
    };
};

export const SalesProvider = ({ children }) => {
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeads = useCallback(async () => {
        if (!user) { setLeads([]); setLoading(false); return; }
        setLoading(true);
        try {
            const data = await api.get('/sales');
            const mapped = (Array.isArray(data) ? data : []).map(mapLeadRecord);
            setLeads(mapped);
        } catch (err) {
            console.error('Error fetching deals:', err);
            setLeads(prev => (prev.length === 0 ? initialLeads : prev));
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    useEffect(() => {
        if (!user) return undefined;
        const tick = async () => {
            try {
                await api.post('/sales/automation-jobs/dispatch-due', { limit: 25 });
            } catch (err) {
                // Silent: this runs in background and should not interrupt sales usage.
            }
        };
        tick();
        const interval = setInterval(tick, 45000);
        return () => clearInterval(interval);
    }, [user]);

    const addLead = async (leadData) => {
        const fullName = String(leadData?.name || '').trim();
        const phone = normalizePhone(leadData?.phone || '');
        const email = String(leadData?.email || '').trim().toLowerCase();
        if (!fullName || !phone) {
            throw new Error('Name and phone are required.');
        }
        if (!isValidPhone(phone)) {
            throw new Error('Phone number must be 7 to 15 digits.');
        }
        if (!isValidEmail(email)) {
            throw new Error('Please enter a valid email address.');
        }

        const [firstName, ...lastNameParts] = fullName.split(/\s+/);
        const lastName = lastNameParts.join(' ').trim();
        const normalizedStatus = leadData?.status || 'New';
        const normalizedAiScore = Number(leadData?.aiScore || 0);
        const priority = normalizedAiScore >= 80 ? 'high' : normalizedAiScore >= 50 ? 'medium' : 'low';

        try {
            const createdLead = await api.post('/sales', {
                title: fullName,
                contact_first_name: firstName,
                contact_last_name: lastName || null,
                contact_phone: phone,
                contact_email: email || null,
                company_name: leadData?.campaign?.trim() || null,
                source: leadData?.source || 'Manual',
                stage: uiStatusToStage(normalizedStatus),
                priority,
                ai_score: normalizedAiScore > 0 ? normalizedAiScore : null,
                metadata: {
                    campaignName: leadData?.campaign?.trim() || null,
                    projectName: leadData?.project?.trim() || null,
                    timezone: leadData?.timezone?.trim() || null,
                    preferredLocale: String(leadData?.preferredLocale || DEFAULT_PREFERRED_LOCALE)
                        .trim()
                        .toLowerCase() || DEFAULT_PREFERRED_LOCALE,
                },
            });
            const mappedLead = mapLeadRecord(createdLead);
            setLeads((prev) => [mappedLead, ...prev]);
            return mappedLead;
        } catch (err) {
            console.error('Error adding lead:', err);
            throw err;
        }
    };

    const updateLeadStatus = async (leadId, newStatus) => {
        const previous = leads;
        setLeads((prev) =>
            prev.map((lead) =>
                lead.id === leadId
                    ? {
                          ...lead,
                          status: newStatus,
                          scoreLabel: intentLabelFromStatusAndScore(newStatus, lead.aiScore),
                      }
                    : lead
            )
        );
        try {
            await api.put(`/sales/${leadId}`, { stage: uiStatusToStage(newStatus) });
            return true;
        } catch (err) {
            console.error('Error updating lead status:', err);
            setLeads(previous);
            return false;
        }
    };

    const refreshLeadActivities = useCallback(async (leadId) => {
        if (!user || !isPersistableLeadId(leadId)) return;
        try {
            const rows = await api.get(`/sales/${leadId}/actions`);
            const rowsArr = Array.isArray(rows) ? rows : [];
            const hydrated = hydrateLeadStateFromActions(rowsArr);
            setLeads((prev) =>
                prev.map((l) =>
                    l.id === leadId
                        ? {
                              ...l,
                              timeline: hydrated.timeline,
                              communications: hydrated.communications,
                              followups: hydrated.followups,
                              lastInteraction: hydrated.lastInteraction || l.lastInteraction,
                          }
                        : l
                )
            );
        } catch (err) {
            console.error('refreshLeadActivities:', err);
        }
    }, [user]);

    const addActionToLead = async (leadId, type, action, detail, additionalData = {}) => {
        let serverRow = null;
        if (isPersistableLeadId(leadId)) {
            try {
                serverRow = await api.post(
                    `/sales/${leadId}/actions`,
                    buildLeadActionPayload(type, action, detail, additionalData)
                );
            } catch (e) {
                console.error('Persist lead action failed:', e);
            }
        }

        setLeads((prev) =>
            prev.map((lead) => {
                if (lead.id !== leadId) return lead;

                const now = new Date();
                const timeStr =
                    now.toLocaleDateString() +
                    ' ' +
                    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const newEvent = {
                    id: serverRow?.id || Date.now(),
                    type,
                    action,
                    time: timeStr,
                    detail,
                };

                const updatedTimeline = [newEvent, ...(lead.timeline || [])];
                let updatedCommunications = lead.communications || [];
                let updatedFollowups = lead.followups || [];

                if (type === 'call') {
                    updatedCommunications = [
                        {
                            id: serverRow?.id || Date.now() + 1,
                            type: 'call',
                            time: timeStr,
                            duration: additionalData.duration || '0m 0s',
                            outcome: additionalData.outcome || 'Logged',
                            recording: additionalData.recording,
                            recordingUrl: additionalData.recordingUrl || null,
                            transcript: additionalData.transcript || [],
                        },
                        ...updatedCommunications,
                    ];
                } else if (type === 'whatsapp') {
                    const existingWaIdx = updatedCommunications.findIndex((c) => c.type === 'whatsapp');
                    const newMsg = {
                        id: serverRow?.id || Date.now() + 2,
                        sender: additionalData.sender || 'SalesRep',
                        text: detail,
                        time: timeStr,
                    };

                    if (existingWaIdx >= 0) {
                        const existingWa = updatedCommunications[existingWaIdx];
                        updatedCommunications[existingWaIdx] = {
                            ...existingWa,
                            history: [...(existingWa.history || []), newMsg],
                        };
                    } else {
                        updatedCommunications = [
                            {
                                id: Date.now() + 1,
                                type: 'whatsapp',
                                history: [newMsg],
                            },
                            ...updatedCommunications,
                        ];
                    }
                } else if (type === 'meeting' && additionalData.date) {
                    updatedFollowups = [
                        {
                            id: serverRow?.id || Date.now() + 3,
                            task: `Meeting scheduled: ${detail}`,
                            status: 'Pending',
                            time: additionalData.date + (additionalData.time ? ' ' + additionalData.time : ''),
                        },
                        ...updatedFollowups,
                    ];
                } else if (type === 'note') {
                    /* timeline only */
                }

                return {
                    ...lead,
                    timeline: updatedTimeline,
                    communications: updatedCommunications,
                    followups: updatedFollowups,
                    lastInteraction: action,
                };
            })
        );
    };

    const assignLead = (leadId, agentName) => {
        setLeads(prev => prev.map(lead => {
            if (lead.id !== leadId) return lead;
            return {
                ...lead,
                assignedTo: agentName,
                timeline: [
                    {
                        id: Date.now(),
                        type: 'ai_action',
                        action: 'Lead Assigned',
                        time: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        detail: `Lead assigned to ${agentName}`
                    },
                    ...(lead.timeline || [])
                ]
            };
        }));
    };

    const scheduleAutomationHandshake = async (leadId, data) => {
        if (!isPersistableLeadId(leadId)) {
            throw new Error('Automation scheduling is available only for persisted leads.');
        }
        const payload = {
            sourceChannel: data.sourceChannel,
            targetChannel: data.targetChannel,
            scheduleAt: data.scheduleAt,
            payload: data.payload || {},
        };
        const job = await api.post(`/sales/${leadId}/automation-jobs`, payload);
        await refreshLeadActivities(leadId);
        return job;
    };

    const getLeadAutomationJobs = async (leadId, status = null) => {
        if (!isPersistableLeadId(leadId)) return [];
        const query = status ? `?status=${encodeURIComponent(status)}` : '';
        return api.get(`/sales/${leadId}/automation-jobs${query}`);
    };

    const value = {
        leads,
        loading,
        addLead,
        updateLeadStatus,
        addActionToLead,
        refreshLeadActivities,
        assignLead,
        scheduleAutomationHandshake,
        getLeadAutomationJobs,
    };

    return (
        <SalesContext.Provider value={value}>
            {children}
        </SalesContext.Provider>
    );
};
