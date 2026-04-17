import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const SalesContext = createContext(null);

export const useSales = () => {
    const context = useContext(SalesContext);
    if (!context) {
        throw new Error('useSales must be used within a SalesProvider');
    }
    return context;
};

// Map backend deals to frontend lead interface
const initialLeads = [
    {
        id: '1',
        name: 'Priya Sharma',
        phone: '98xxxx',
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

export const SalesProvider = ({ children }) => {
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeads = useCallback(async () => {
        if (!user) { setLeads([]); setLoading(false); return; }
        setLoading(true);
        try {
            const data = await api.get('/sales');
            const mapped = data.map(deal => ({
                id: deal.id,
                name: `${deal.contact_first_name || ''} ${deal.contact_last_name || ''}`.trim() || 'Unknown Contact',
                phone: deal.contact_email || 'No Contact Data',
                source: deal.metadata?.source || 'API/Web',
                project: 'Default Project',
                campaign: deal.title,
                status: deal.stage === 'closed_won' ? 'Hot' : deal.stage === 'lead' ? 'Warm' : 'Cold',
                aiScore: deal.priority === 'high' ? 95 : deal.priority === 'medium' ? 60 : 30,
                dealProbability: deal.value > 0 ? 80 : 30,
                scoreLabel: deal.priority || 'medium',
                lastInteraction: 'Updated from DB',
                assignedTo: deal.assigned_to || 'Unassigned',
                createdDate: deal.created_at,
                rawDeal: deal,
                timeline: [],
                communications: [],
                followups: []
            }));
            setLeads(mapped);
        } catch (err) {
            console.error('Error fetching deals:', err);
            // Fallback to initial mock if API is not populated for UI preview
            setLeads(prev => prev.length === 0 ? initialLeads : prev);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const addLead = async (leadData) => {
        // Optimistic UI update could be applied here
        try {
            const newDeal = await api.post('/sales', {
                title: leadData.campaign || 'New Lead',
                stage: leadData.status === 'Hot' ? 'negotiation' : 'lead',
                priority: leadData.aiScore > 80 ? 'high' : 'medium'
            });
            await fetchLeads(); // refresh
            return newDeal;
        } catch (err) {
            console.error('Error adding lead:', err);
            return null;
        }
    };

    const updateLeadStatus = async (leadId, newStatus) => {
        // Optimistic
        setLeads(prev => prev.map(lead =>
            lead.id === leadId ? { ...lead, status: newStatus } : lead
        ));
    };

    const addActionToLead = (leadId, type, action, detail, additionalData = {}) => {
        setLeads(prev => prev.map(lead => {
            if (lead.id !== leadId) return lead;

            const now = new Date();
            const timeStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const newEvent = {
                id: Date.now(),
                type,
                action,
                time: timeStr,
                detail
            };

            const updatedTimeline = [newEvent, ...(lead.timeline || [])];
            let updatedCommunications = lead.communications || [];
            let updatedFollowups = lead.followups || [];

            if (type === 'call') {
                updatedCommunications = [
                    {
                        id: Date.now() + 1,
                        type: 'call',
                        time: timeStr,
                        duration: additionalData.duration || '0m 0s',
                        outcome: additionalData.outcome || 'Logged',
                        recording: additionalData.recording,
                        transcript: additionalData.transcript
                    },
                    ...updatedCommunications
                ];
            } else if (type === 'whatsapp') {
                // Find existing whatsapp comm or create new
                const existingWaIdx = updatedCommunications.findIndex(c => c.type === 'whatsapp');
                const newMsg = {
                    id: Date.now() + 2,
                    sender: 'SalesRep',
                    text: detail,
                    time: timeStr
                };

                if (existingWaIdx >= 0) {
                    const existingWa = updatedCommunications[existingWaIdx];
                    updatedCommunications[existingWaIdx] = {
                        ...existingWa,
                        history: [...(existingWa.history || []), newMsg]
                    };
                } else {
                    updatedCommunications = [
                        {
                            id: Date.now() + 1,
                            type: 'whatsapp',
                            history: [newMsg]
                        },
                        ...updatedCommunications
                    ];
                }
            } else if (type === 'meeting' && additionalData.date) {
                updatedFollowups = [
                    {
                        id: Date.now() + 3,
                        task: `Meeting scheduled: ${detail}`,
                        status: 'Pending',
                        time: additionalData.date + (additionalData.time ? ' ' + additionalData.time : '')
                    },
                    ...updatedFollowups
                ];
            } else if (type === 'note') {
                // Note just goes to timeline, no extra collections
            }

            return {
                ...lead,
                timeline: updatedTimeline,
                communications: updatedCommunications,
                followups: updatedFollowups,
                lastInteraction: action
            };
        }));
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

    const value = {
        leads,
        loading,
        addLead,
        updateLeadStatus,
        addActionToLead,
        assignLead
    };

    return (
        <SalesContext.Provider value={value}>
            {children}
        </SalesContext.Provider>
    );
};
