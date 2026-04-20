import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Megaphone,
  Loader2,
  Users,
  Calendar,
  Plus,
  Sparkles,
  Filter,
  Phone,
  MessageSquare,
  Upload,
  Save,
  Play,
  Pause,
  RotateCcw,
  Link as LinkIcon,
  Flame,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import api from '../../lib/api';
import { useSubscription } from '../../commerce/SubscriptionContext';
import { useSales } from '../../context/SalesContext';
import { useIntegrations } from '../../context/IntegrationContext';

const FILTERS = ['All', 'Hot', 'Warm', 'Cold', 'Converted'];

const scoreToLabel = (lead) => {
  const explicit = lead?.scoreLabel || lead?.aiScoreLabel || lead?.ai_score_label;
  if (explicit) return explicit;
  const score = Number(lead?.aiScore ?? lead?.ai_score ?? lead?.ai_score_value);
  if (!Number.isFinite(score)) return 'Warm';
  if (score >= 80) return 'Hot';
  if (score >= 50) return 'Warm';
  return 'Cold';
};

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString();
};

const formatStatus = (s) => {
  const v = String(s || '').toLowerCase();
  if (v === 'active') return { label: 'Active', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  if (v === 'paused') return { label: 'Paused', cls: 'bg-amber-100 text-amber-700 border-amber-200' };
  if (v === 'completed') return { label: 'Completed', cls: 'bg-gray-200 text-gray-700 border-gray-200' };
  if (v === 'draft') return { label: 'Draft', cls: 'bg-blue-100 text-blue-700 border-blue-200' };
  return { label: v ? v.charAt(0).toUpperCase() + v.slice(1) : '—', cls: 'bg-gray-100 text-gray-700 border-gray-200' };
};

const buildScriptPrompt = ({ goal, audience, websiteUrl }) => {
  const parts = [
    `You are a senior sales script writer for an AI calling agent.`,
    `Write a concise calling script for a sales campaign.`,
    `Campaign goal: ${goal || 'Not provided'}`,
    `Target audience: ${audience || 'Not provided'}`,
  ];
  if (websiteUrl) parts.push(`Website context (use to tailor script): ${websiteUrl}`);
  parts.push(
    `Return the script as clean Markdown only (no HTML, no JSON).`,
    `Formatting rules:`,
    `- Use ## for the five main sections exactly in this order: Opener, Qualifying questions, Pitch, Objection handling, Closing CTA.`,
    `- Under each ## section use normal paragraphs and/or Markdown bullet lists (- item).`,
    `- Do not wrap entire sections in quotation marks. Do not use ### subheadings unless you need one short subheading inside Objection handling.`,
    `- Do not use bracket placeholders like [Name], [Your Name], or [Company]. Write natural generic wording (e.g. greet the person by name only if the rep will see it in CRM—otherwise say "Hi there" or "Hello").`,
    `- For Objection handling use a numbered Markdown list; each item should be **Objection:** … then a new line with **Reply:** …`,
    `- Keep tone conversational and easy to read aloud.`,
  );
  return parts.join('\n');
};

const buildWhatsAppPrompt = ({ goal, offerDetails, websiteUrl }) => {
  const parts = [
    `You are a senior sales copywriter.`,
    `Write WhatsApp outreach copy for a sales campaign.`,
    `Campaign goal: ${goal || 'Not provided'}`,
    `Offer details: ${offerDetails || 'Not provided'}`,
  ];
  if (websiteUrl) parts.push(`Website context (use to tailor message): ${websiteUrl}`);
  parts.push(
    `Return Markdown only (no HTML, no JSON).`,
    `Structure exactly:`,
    `## Primary message`,
    `One WhatsApp-ready message (under ~450 characters of plain text if you strip Markdown—keep it short on the phone).`,
    `## Alternative A`,
    `A shorter or softer variant.`,
    `## Alternative B`,
    `A different angle or urgency level.`,
    `Formatting rules:`,
    `- Under each ## section use 1–3 short paragraphs or a tight bullet list (- item) if it reads better on mobile.`,
    `- No bracket placeholders like [Name]. Use generic wording or "Hi" without fake merge fields.`,
    `- Tone: friendly, professional, no hype, clear CTA. Use **bold** sparingly for the CTA line only.`,
  );
  return parts.join('\n');
};

const SalesCampaignDetails = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isModuleActive } = useSubscription();
  const hasMarketing = isModuleActive('marketing');
  const { integrations } = useIntegrations();
  const isFacebookConnected = Boolean(integrations?.meta?.connected);
  const isGoogleConnected   = Boolean(integrations?.google?.connected);

  const { leads: salesLeads } = useSales();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState(location.state?.filter || 'All');
  const [addOpen, setAddOpen] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '' });

  const [manualLeads, setManualLeads] = useState([]);

  // Workspace state (persisted into campaign metadata)
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [savingWebsite, setSavingWebsite] = useState(false);

  const [callingEnabled, setCallingEnabled] = useState(false);
  const [callingGoal, setCallingGoal] = useState('');
  const [callingAudience, setCallingAudience] = useState('');
  const [callingScript, setCallingScript] = useState('');
  const [generatingScript, setGeneratingScript] = useState(false);
  const [uploadingScriptError, setUploadingScriptError] = useState(null);

  const [waEnabled, setWaEnabled] = useState(false);
  const [waGoal, setWaGoal] = useState('');
  const [waOffer, setWaOffer] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [generatingMessage, setGeneratingMessage] = useState(false);

  const [savingComm, setSavingComm] = useState(false);
  const [workspaceError, setWorkspaceError] = useState(null);
  const [leadFormError, setLeadFormError] = useState(null);
  const [updatingCampaignStatus, setUpdatingCampaignStatus] = useState(false);

  // Add Lead modal states
  const [addMethod, setAddMethod] = useState(null); // null | 'csv' | 'pdf' | 'manual'
  const [csvFile, setCsvFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Keep page clean: switch between Details and Leads views
  const [activeView, setActiveView] = useState('details'); // 'details' | 'leads'

  // Facebook Lead Form state
  const DEFAULT_QUESTIONS = [
    { type: 'FULL_NAME',    label: 'Name',  enabled: true },
    { type: 'EMAIL',        label: 'Email', enabled: true },
    { type: 'PHONE_NUMBER', label: 'Phone', enabled: true },
  ];
  const [fbFormOpen, setFbFormOpen]       = useState(false);
  const [fbFormName, setFbFormName]       = useState('');
  const [fbQuestions, setFbQuestions]     = useState(DEFAULT_QUESTIONS);
  const [creatingForm, setCreatingForm]   = useState(false);
  const [fbFormError, setFbFormError]     = useState(null);
  const [fbFormCreated, setFbFormCreated] = useState(
    () => Boolean(null) // will be hydrated from campaign metadata below
  );

  // Facebook lead sync state
  const [syncingFbLeads, setSyncingFbLeads] = useState(false);
  const [fbSyncResult, setFbSyncResult]     = useState(null);
  const [fbSyncError, setFbSyncError]       = useState(null);
  const [fbReauthNeeded, setFbReauthNeeded] = useState(false);

  // Google lead sync state
  const [syncingGLeads, setSyncingGLeads]  = useState(false);
  const [gSyncResult, setGSyncResult]      = useState(null);
  const [gSyncError, setGSyncError]        = useState(null);
  const [gReauthNeeded, setGReauthNeeded]  = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!hasMarketing) {
        setLoading(false);
        setCampaign(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(`/marketing/campaigns/${campaignId}`);
        setCampaign(data || null);
      } catch (e) {
        setError(e?.message || 'Failed to load campaign');
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [campaignId, hasMarketing]);

  // Hydrate workspace state from campaign metadata once campaign loads
  useEffect(() => {
    const md = campaign?.metadata || {};
    setWebsiteUrl(md.website_url || md.websiteUrl || '');
    setCallingEnabled(Boolean(md.calling_enabled));
    setCallingGoal(md.calling_goal || '');
    setCallingAudience(md.calling_audience || '');
    setCallingScript(md.calling_script || '');
    setWaEnabled(Boolean(md.whatsapp_enabled));
    setWaGoal(md.whatsapp_goal || '');
    setWaOffer(md.whatsapp_offer || '');
    setWaMessage(md.whatsapp_message || '');
    // Hydrate FB lead form status
    setFbFormCreated(Boolean(md.facebook_lead_form_id));
  }, [campaign?.id]); // intentional: hydrate when switching campaign

  const openLeadsView = () => setActiveView('leads');
  const openDetailsView = () => setActiveView('details');

  const fetchLeads = async () => {
    setLeadsLoading(true);
    try {
      const data = await api.get(`/sales/campaigns/${campaignId}/leads`);
      const list = Array.isArray(data?.leads) ? data.leads : Array.isArray(data) ? data : [];
      setManualLeads(list);
    } catch {
      setManualLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasMarketing) return;
    // Lazy-load: fetch campaign first; then load leads.
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, hasMarketing]);

  const syncedLeads = useMemo(() => {
    if (!campaign?.name) return [];
    // Heuristic “auto sync”: include Sales leads whose campaign matches campaign name.
    // Mark their source as Marketing Campaign to align with requirement.
    return (salesLeads || [])
      .filter((l) => String(l.campaign || '').trim() === String(campaign.name).trim())
      .map((l) => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        source: 'Marketing Campaign',
        aiScore: l.aiScore,
        scoreLabel: l.scoreLabel || scoreToLabel(l),
        status: l.status === 'Won' ? 'Converted' : l.status,
        lastActivity: l.lastInteraction || '—',
        _linkToLead: `/sales/leads/${l.id}`,
      }));
  }, [salesLeads, campaign?.name]);

  const combinedLeads = useMemo(() => {
    const fromBackend = (manualLeads || []).map((l) => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      source: l.source || 'Manual',
      email: l.email || null,
      aiScore: l.ai_score ?? l.aiScore ?? null,
      scoreLabel: l.ai_score_label || l.scoreLabel || scoreToLabel(l),
      status: l.status || 'New',
      lastActivity: l.last_activity || l.lastActivity || l.created_at || l.createdAt || '—',
      _linkToLead: l.deal_id ? `/sales/leads/${l.deal_id}` : null,
    }));

    // De-dupe by phone+name if possible (avoid double showing)
    const key = (x) => `${String(x.phone || '').trim()}::${String(x.name || '').trim()}`.toLowerCase();
    const seen = new Set();
    const merged = [];
    for (const item of [...syncedLeads, ...fromBackend]) {
      const k = key(item);
      if (k === '::') {
        merged.push(item);
        continue;
      }
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(item);
    }
    return merged;
  }, [manualLeads, syncedLeads]);

  const filteredLeads = useMemo(() => {
    if (filter === 'All') return combinedLeads;
    if (filter === 'Converted') return combinedLeads.filter((l) => (l.status || '').toLowerCase() === 'converted' || (l.status || '').toLowerCase() === 'won');
    return combinedLeads.filter((l) => scoreToLabel(l) === filter || (l.status || '') === filter);
  }, [combinedLeads, filter]);

  const hotCount = useMemo(() => combinedLeads.filter((l) => scoreToLabel(l) === 'Hot').length, [combinedLeads]);
  const onHotClick = () => setFilter('Hot');

  const onLeadClick = (l) => {
    if (l._linkToLead) navigate(l._linkToLead);
  };

  const saveLead = async (e) => {
    e.preventDefault();
    if (!leadForm.name.trim() || !leadForm.phone.trim()) return;
    setSavingLead(true);
    setLeadFormError(null);
    try {
      await api.post(`/sales/campaigns/${campaignId}/leads`, {
        name: leadForm.name.trim(),
        phone: leadForm.phone.trim(),
        email: leadForm.email?.trim() || null,
      });
      setLeadForm({ name: '', phone: '', email: '' });
      await fetchLeads();
      setActiveView('leads');
      setUploadSuccess('Lead added successfully');
      setTimeout(() => {
        setAddOpen(false);
        setAddMethod(null);
        setUploadSuccess(null);
      }, 1500);
    } catch (err) {
      setLeadFormError(err?.message || 'Failed to add lead');
    } finally {
      setSavingLead(false);
    }
  };

  const handleCsvUpload = async (file) => {
    if (!file) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('campaignId', campaignId);
      const result = await api.post('/sales/leads/upload/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCsvFile(null);
      
      // Refresh leads and switch to leads view
      await fetchLeads();
      setActiveView('leads');
      
      setUploadSuccess(`${result?.count || 1} lead(s) uploaded successfully`);
      setTimeout(() => {
        setAddOpen(false);
        setAddMethod(null);
        setUploadSuccess(null);
      }, 2000);
    } catch (error) {
      setUploadSuccess(`Error uploading CSV: ${error?.message || 'Unknown error'}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePdfUpload = async (file) => {
    if (!file) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('campaignId', campaignId);
      const result = await api.post('/sales/leads/upload/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPdfFile(null);
      
      // Refresh leads and switch to leads view
      await fetchLeads();
      setActiveView('leads');
      
      setUploadSuccess(`${result?.count || 1} lead(s) extracted successfully`);
      setTimeout(() => {
        setAddOpen(false);
        setAddMethod(null);
        setUploadSuccess(null);
      }, 2000);
    } catch (error) {
      setUploadSuccess(`Error uploading PDF: ${error?.message || 'Unknown error'}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const isManualCampaign = useMemo(() => {
    const md = campaign?.metadata || {};
    const createdFrom = md.created_from || md.createdFrom;
    return String(createdFrom || '').toLowerCase() === 'sales' || String(campaign?.platform || '').toLowerCase() === 'manual';
  }, [campaign?.id, campaign?.platform, campaign?.metadata]);

  const sourceLabel = useMemo(() => (isManualCampaign ? 'Manual' : 'Marketing'), [isManualCampaign]);

  const saveWebsite = async () => {
    if (!websiteUrl.trim()) return;
    setSavingWebsite(true);
    setWorkspaceError(null);
    try {
      const updated = await api.post(`/sales/campaigns/${campaignId}/website`, { websiteUrl: websiteUrl.trim() });
      const camp = updated?.campaign ?? updated;
      if (camp?.id) setCampaign(camp);
    } catch (e) {
      setWorkspaceError(e?.message || 'Failed to save website URL');
    } finally {
      setSavingWebsite(false);
    }
  };

  const saveCommSetup = async () => {
    setSavingComm(true);
    setWorkspaceError(null);
    try {
      const baseMd = campaign?.metadata || {};
      const nextMd = {
        ...baseMd,
        calling_enabled: callingEnabled,
        calling_goal: callingGoal,
        calling_audience: callingAudience,
        calling_script: callingScript,
        whatsapp_enabled: waEnabled,
        whatsapp_goal: waGoal,
        whatsapp_offer: waOffer,
        whatsapp_message: waMessage,
      };
      const updated = await api.put(`/marketing/campaigns/${campaignId}`, { metadata: nextMd });
      if (updated?.id) setCampaign(updated);
    } catch (e) {
      setWorkspaceError(e?.message || 'Failed to save setup');
    } finally {
      setSavingComm(false);
    }
  };

  const setCampaignStatus = async (status) => {
    setUpdatingCampaignStatus(true);
    setWorkspaceError(null);
    try {
      const updated = await api.put(`/marketing/campaigns/${campaignId}`, { status });
      if (updated?.id) setCampaign(updated);
    } catch (e) {
      setWorkspaceError(e?.message || 'Failed to update campaign status');
    } finally {
      setUpdatingCampaignStatus(false);
    }
  };

  const generateCallingScript = async () => {
    setGeneratingScript(true);
    setWorkspaceError(null);
    try {
      const prompt = buildScriptPrompt({ goal: callingGoal, audience: callingAudience, websiteUrl: websiteUrl?.trim() });
      const res = await api.post('/ai/chat', { message: prompt });
      const text = res?.response || '';
      setCallingScript(text);
    } catch (e) {
      setWorkspaceError(e?.message || 'Failed to generate script');
    } finally {
      setGeneratingScript(false);
    }
  };

  const generateWhatsApp = async () => {
    setGeneratingMessage(true);
    setWorkspaceError(null);
    try {
      const prompt = buildWhatsAppPrompt({ goal: waGoal, offerDetails: waOffer, websiteUrl: websiteUrl?.trim() });
      const res = await api.post('/ai/chat', { message: prompt });
      const text = res?.response || '';
      setWaMessage(text);
    } catch (e) {
      setWorkspaceError(e?.message || 'Failed to generate WhatsApp message');
    } finally {
      setGeneratingMessage(false);
    }
  };

  const handleScriptUpload = async (file) => {
    setUploadingScriptError(null);
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext === 'txt') {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
      setCallingScript(text);
      return;
    }
    if (ext === 'pdf') {
      setUploadingScriptError('PDF uploaded. Please paste the script content manually (PDF text extraction coming later).');
      return;
    }
    setUploadingScriptError('Unsupported file type. Upload .txt or .pdf');
  };

  const activityFeed = useMemo(() => {
    // Campaign-specific feed from synced Sales leads timeline
    if (!campaign?.name) return [];
    const name = String(campaign.name).trim();
    const events = [];

    (salesLeads || [])
      .filter((l) => String(l.campaign || '').trim() === name)
      .forEach((lead) => {
        (lead.timeline || []).forEach((ev) => {
          events.push({
            id: ev.id || `${lead.id}-${ev.time}-${ev.type}`,
            type: ev.type,
            text: ev.type === 'call'
              ? `AI called ${lead.name}`
              : ev.type === 'whatsapp'
                ? `WhatsApp sent to ${lead.name}`
                : ev.type === 'ai_action'
                  ? `AI updated ${lead.name}`
                  : ev.type === 'capture'
                    ? `Lead captured: ${lead.name}`
                    : `${ev.action || 'Activity'} — ${lead.name}`,
            time: ev.time,
            leadId: lead.id,
            leadName: lead.name,
          });
        });
      });

    events.sort((a, b) => new Date(b.time) - new Date(a.time));
    return events.slice(0, 10);
  }, [salesLeads, campaign?.name]);

  const performanceStats = useMemo(() => {
    if (!campaign?.name) return { calls: 0, waSent: 0, replies: 0, conversions: 0 };
    const name = String(campaign.name).trim();
    const relevant = (salesLeads || []).filter((l) => String(l.campaign || '').trim() === name);
    const calls = relevant.reduce((acc, l) => acc + (l.communications || []).filter((c) => c.type === 'call').length, 0);
    const waChats = relevant.reduce((acc, l) => acc + (l.communications || []).filter((c) => c.type === 'whatsapp').length, 0);
    const replies = relevant.reduce((acc, l) => {
      const wa = (l.communications || []).find((c) => c.type === 'whatsapp');
      const leadReplies = (wa?.history || []).filter((m) => String(m.sender || '').toLowerCase() === 'lead').length;
      return acc + leadReplies;
    }, 0);
    const conversions = relevant.filter((l) => l.status === 'Won' || l.status === 'Converted').length;
    return { calls, waSent: waChats, replies, conversions };
  }, [salesLeads, campaign?.name]);

  const hasWebsiteContext = Boolean(websiteUrl?.trim());
  const hasCallingScript = Boolean(callingScript?.trim());
  const hasWhatsAppMessage = Boolean(waMessage?.trim());

  const handleSyncFromFacebook = async () => {
    setSyncingFbLeads(true);
    setFbSyncResult(null);
    setFbSyncError(null);
    setFbReauthNeeded(false);
    try {
      const result = await api.post(`/sales/campaigns/${campaignId}/sync-leads/facebook`);
      setFbSyncResult(result);
      await fetchLeads();
      setTimeout(() => setFbSyncResult(null), 4000);
    } catch (err) {
      const errData = err?.response?.data?.error;
      if (errData?.requiresReauth) {
        setFbReauthNeeded(true);
      } else {
        setFbSyncError(errData?.message || err?.message || 'Failed to sync leads from Facebook');
        setTimeout(() => setFbSyncError(null), 4000);
      }
    } finally {
      setSyncingFbLeads(false);
    }
  };

  const handleSyncFromGoogle = async () => {
    setSyncingGLeads(true);
    setGSyncResult(null);
    setGSyncError(null);
    setGReauthNeeded(false);
    try {
      const result = await api.post(`/sales/campaigns/${campaignId}/sync-leads/google`);
      setGSyncResult(result);
      await fetchLeads();
      setTimeout(() => setGSyncResult(null), 4000);
    } catch (err) {
      const errData = err?.response?.data?.error;
      if (errData?.requiresReauth) {
        setGReauthNeeded(true);
      } else {
        setGSyncError(errData?.message || err?.message || 'Failed to sync leads from Google');
        setTimeout(() => setGSyncError(null), 4000);
      }
    } finally {
      setSyncingGLeads(false);
    }
  };

  const handleCreateLeadForm = async (e) => {
    e.preventDefault();
    if (!fbFormName.trim()) return;
    setCreatingForm(true);
    setFbFormError(null);
    try {
      const enabledQs = fbQuestions
        .filter((q) => q.enabled)
        .map(({ type, label }) => ({ type, label }));
      await api.post(`/sales/campaigns/${campaignId}/lead-form/facebook`, {
        formName: fbFormName.trim(),
        questions: enabledQs,
      });
      setFbFormCreated(true);
      setFbFormOpen(false);
      setFbFormName('');
    } catch (err) {
      setFbFormError(err?.message || 'Failed to create form');
    } finally {
      setCreatingForm(false);
    }
  };

  const setupChecklist = useMemo(() => {
    const items = [
      { key: 'calling',  label: 'AI Calling enabled',      done: callingEnabled },
      { key: 'script',   label: 'Calling script ready',    done: hasCallingScript },
      { key: 'whatsapp', label: 'WhatsApp enabled',        done: waEnabled },
      { key: 'message',  label: 'Message template ready',  done: hasWhatsAppMessage },
      ...(isManualCampaign ? [{ key: 'website', label: 'Website context set', done: hasWebsiteContext }] : []),
      ...(isFacebookConnected ? [{ key: 'fb_form', label: 'Facebook Lead Form', done: fbFormCreated }] : []),
    ];
    const doneCount = items.filter(i => i.done).length;
    return { items, doneCount, total: items.length };
  }, [callingEnabled, waEnabled, hasCallingScript, hasWhatsAppMessage, isManualCampaign, hasWebsiteContext, isFacebookConnected, fbFormCreated]);

  if (!hasMarketing) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Megaphone size={22} />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Marketing module required to view campaigns</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">Unlock Marketing to sync campaigns and track leads inside Sales.</p>
        <button
          onClick={() => (window.location.href = '/#pricing')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          Unlock Marketing
        </button>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-900 pb-12">
      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => {
              setAddOpen(false);
              setAddMethod(null);
              setCsvFile(null);
              setPdfFile(null);
              setUploadSuccess(null);
              setLeadFormError(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.96, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 16, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-blue-600" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{addMethod ? 'Add Lead' : 'Add Leads'}</p>
                    <p className="text-xs text-gray-500">{addMethod ? (addMethod === 'manual' ? 'Manual entry' : addMethod === 'csv' ? 'CSV upload' : 'PDF upload') : 'Choose input method'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAddOpen(false);
                    setAddMethod(null);
                    setCsvFile(null);
                    setPdfFile(null);
                    setUploadSuccess(null);
                    setLeadFormError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>

              {addMethod === null ? (
                // Method Selection Screen
                <div className="p-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLeadFormError(null);
                      setAddMethod('csv');
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                  >
                    <p className="font-semibold text-gray-900 mb-1">📊 Upload CSV</p>
                    <p className="text-xs text-gray-500">Import multiple leads from spreadsheet</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLeadFormError(null);
                      setAddMethod('pdf');
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                  >
                    <p className="font-semibold text-gray-900 mb-1">📄 Upload PDF</p>
                    <p className="text-xs text-gray-500">Extract leads from PDF document</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLeadFormError(null);
                      setAddMethod('manual');
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
                  >
                    <p className="font-semibold text-gray-900 mb-1">✍️ Manual Entry</p>
                    <p className="text-xs text-gray-500">Add leads one by one</p>
                  </button>
                </div>
              ) : addMethod === 'csv' ? (
                // CSV Upload
                <div className="p-5 space-y-4">
                  {uploadSuccess ? (
                    <div className={`p-4 rounded-lg text-sm font-medium ${uploadSuccess.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {uploadSuccess}
                    </div>
                  ) : (
                    <>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setCsvFile(e.target.files?.[0])}
                            className="hidden"
                          />
                          <p className="text-sm font-medium text-gray-700">Click to select CSV file</p>
                          <p className="text-xs text-gray-500 mt-1">{csvFile?.name || 'No file selected'}</p>
                        </label>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setAddMethod(null)}
                          className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => handleCsvUpload(csvFile)}
                          disabled={!csvFile || uploadingFile}
                          className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                        >
                          {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={14} />}
                          Upload CSV
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : addMethod === 'pdf' ? (
                // PDF Upload
                <div className="p-5 space-y-4">
                  {uploadSuccess ? (
                    <div className={`p-4 rounded-lg text-sm font-medium ${uploadSuccess.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {uploadSuccess}
                    </div>
                  ) : (
                    <>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setPdfFile(e.target.files?.[0])}
                            className="hidden"
                          />
                          <p className="text-sm font-medium text-gray-700">Click to select PDF file</p>
                          <p className="text-xs text-gray-500 mt-1">{pdfFile?.name || 'No file selected'}</p>
                        </label>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setAddMethod(null)}
                          className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => handlePdfUpload(pdfFile)}
                          disabled={!pdfFile || uploadingFile}
                          className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                        >
                          {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={14} />}
                          Upload PDF
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // Manual Entry Form
                <form onSubmit={saveLead} className="p-5 space-y-4">
                  {leadFormError && (
                    <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">{leadFormError}</div>
                  )}
                  {uploadSuccess && !leadFormError && (
                    <div className="p-3 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">{uploadSuccess}</div>
                  )}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Name</label>
                    <input
                      value={leadForm.name}
                      onChange={(e) => setLeadForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      placeholder="Lead name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Phone</label>
                    <input
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      placeholder="+91 98xxxx"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Email (optional)</label>
                    <input
                      value={leadForm.email}
                      onChange={(e) => setLeadForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      placeholder="name@company.com"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAddMethod(null)}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={savingLead || !leadForm.name.trim() || !leadForm.phone.trim()}
                      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      {savingLead ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={14} />}
                      Add Lead
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 font-medium transition-colors mb-2"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Megaphone size={22} className="text-blue-600" /> {campaign?.name || 'Campaign Workspace'}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Campaign Control Center for sales execution</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => (activeView === 'leads' ? openDetailsView() : openLeadsView())}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold rounded-lg border border-gray-200 transition-colors"
            >
              <Users size={16} className="text-gray-500" /> {activeView === 'leads' ? 'Back to Details' : 'View Leads'}
            </button>
            <button
              onClick={() => {
                setLeadFormError(null);
                setAddOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Plus size={16} /> Add Lead
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 flex items-center justify-center text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading campaign...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          {error}
        </div>
      ) : (
        <>
          {workspaceError && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
              {workspaceError}
            </div>
          )}
          {activeView === 'details' ? (
            /* ─── 3-Panel Workspace ─── */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* LEFT: Campaign Info */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4 h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Campaign Info</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">{campaign?.name || '—'}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {(() => {
                          const s = formatStatus(campaign?.status);
                          return (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${s.cls}`}>
                              {s.label}
                            </span>
                          );
                        })()}
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border bg-gray-50 text-gray-600 border-gray-200">
                          {sourceLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openLeadsView()}
                      className="text-left bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Total Leads</p>
                      <p className="text-xl font-bold text-gray-900">{combinedLeads.length}</p>
                    </button>
                    <button
                      onClick={() => { onHotClick(); openLeadsView(); }}
                      className="text-left bg-red-50 border border-red-200 rounded-lg p-3 hover:bg-red-100 transition-colors"
                    >
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide inline-flex items-center gap-1">
                        <Flame size={12} /> Hot Leads
                      </p>
                      <p className="text-xl font-bold text-red-700">{hotCount}</p>
                    </button>
                  </div>

                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Created</span>
                      <span className="text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5">
                        <Calendar size={12} className="text-gray-400" />
                        {formatDate(campaign?.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Last update</span>
                      <span className="text-xs font-semibold text-gray-700">
                        {formatDate(campaign?.updated_at || campaign?.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Campaign ID</span>
                      <button
                        onClick={() => navigator.clipboard?.writeText(String(campaign?.id || campaignId))}
                        className="text-xs font-semibold text-blue-700 hover:underline truncate max-w-[140px]"
                        title="Copy campaign ID"
                      >
                        {String(campaign?.id || campaignId).slice(0, 8)}…
                      </button>
                    </div>
                  </div>

                  {/* Setup readiness */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Setup readiness</p>
                      <span className="text-xs font-bold text-gray-700">{setupChecklist.doneCount}/{setupChecklist.total}</span>
                    </div>
                    <div className="mt-2 space-y-2">
                      {setupChecklist.items.map((it) => (
                        <div key={it.key}>
                          <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                            <span className="text-xs font-semibold text-gray-700">{it.label}</span>
                            {it.key === 'fb_form' ? (
                              <div className="flex items-center gap-2">
                                {it.done ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">READY</span>
                                ) : (
                                  <button
                                    onClick={() => setFbFormOpen((v) => !v)}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                                  >
                                    {fbFormOpen ? 'CANCEL' : 'CREATE'}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                it.done ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-500 border-gray-200'
                              }`}>
                                {it.done ? 'READY' : 'TODO'}
                              </span>
                            )}
                          </div>

                          {/* Inline Lead Form creator — only for fb_form */}
                          {it.key === 'fb_form' && fbFormOpen && !it.done && (
                            <form
                              onSubmit={handleCreateLeadForm}
                              className="mt-1 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3"
                            >
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Form Name</label>
                                <input
                                  value={fbFormName}
                                  onChange={(e) => setFbFormName(e.target.value)}
                                  placeholder="e.g. Campaign Lead Form"
                                  className="w-full px-2.5 py-2 border border-blue-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Questions</label>
                                <div className="flex flex-wrap gap-1.5">
                                  {fbQuestions.map((q, i) => (
                                    <button
                                      key={q.type}
                                      type="button"
                                      onClick={() => setFbQuestions((prev) => prev.map((x, idx) => idx === i ? { ...x, enabled: !x.enabled } : x))}
                                      className={`text-[10px] font-semibold px-2 py-1 rounded-full border transition-colors ${
                                        q.enabled
                                          ? 'bg-blue-600 text-white border-blue-600'
                                          : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400'
                                      }`}
                                    >
                                      {q.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {fbFormError && (
                                <p className="text-[10px] text-red-600 font-medium">{fbFormError}</p>
                              )}
                              <button
                                type="submit"
                                disabled={creatingForm || !fbFormName.trim()}
                                className="w-full py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
                              >
                                {creatingForm ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                {creatingForm ? 'Creating…' : 'Create Lead Form'}
                              </button>
                            </form>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {isManualCampaign && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <LinkIcon size={14} className="text-blue-600" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Website URL (AI context)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://yourwebsite.com"
                          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                        />
                        <button
                          onClick={saveWebsite}
                          disabled={savingWebsite || !websiteUrl.trim()}
                          className="px-3 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                          {savingWebsite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
                          Save
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Used to improve script + message generation.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CENTER: Communication Control & Performance */}
              <div className="lg:col-span-9">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Communication Control</p>
                      <p className="text-sm text-gray-500 mt-1">Set up AI calling + WhatsApp outreach for this campaign.</p>
                    </div>
                    <button
                      onClick={saveCommSetup}
                      disabled={savingComm}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                    >
                      {savingComm ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
                      Save Setup
                    </button>
                  </div>

                  {/* Calling Setup */}
                  <div id="calling-setup" className="border border-gray-200 rounded-xl p-4 mb-4 scroll-mt-24">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-indigo-600" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Calling Setup</p>
                          <p className="text-xs text-gray-500">Enable AI calling + script</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCallingEnabled((v) => !v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                          callingEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {callingEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Campaign goal</label>
                        <input
                          value={callingGoal}
                          onChange={(e) => setCallingGoal(e.target.value)}
                          placeholder="e.g. book demo calls"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Target audience</label>
                        <input
                          value={callingAudience}
                          onChange={(e) => setCallingAudience(e.target.value)}
                          placeholder="e.g. SME owners in India"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <button
                        onClick={generateCallingScript}
                        disabled={generatingScript}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                      >
                        {generatingScript ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={14} />}
                        Generate Script
                      </button>
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 cursor-pointer">
                        <Upload size={14} className="text-gray-500" />
                        Upload Script
                        <input
                          type="file"
                          accept=".txt,.pdf"
                          className="hidden"
                          onChange={(e) => handleScriptUpload(e.target.files?.[0])}
                        />
                      </label>
                      {uploadingScriptError && <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">{uploadingScriptError}</span>}
                    </div>

                    <div className="mt-3">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Script</label>
                      {callingScript?.trim() ? (
                        <textarea
                          rows={8}
                          value={callingScript}
                          onChange={(e) => setCallingScript(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none"
                        />
                      ) : (
                        <div className="border border-dashed border-gray-200 rounded-lg p-4 text-sm text-gray-500 bg-gray-50">
                          Generate or upload a script to start AI calling
                        </div>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp Setup */}
                  <div id="whatsapp-setup" className="border border-gray-200 rounded-xl p-4 scroll-mt-24">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-green-600" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">WhatsApp Setup</p>
                          <p className="text-xs text-gray-500">Enable messaging + template</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setWaEnabled((v) => !v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                          waEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {waEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Campaign goal</label>
                        <input
                          value={waGoal}
                          onChange={(e) => setWaGoal(e.target.value)}
                          placeholder="e.g. schedule site visits"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Offer details</label>
                        <input
                          value={waOffer}
                          onChange={(e) => setWaOffer(e.target.value)}
                          placeholder="e.g. 10% off this week"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={generateWhatsApp}
                        disabled={generatingMessage}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                      >
                        {generatingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={14} />}
                        Generate WhatsApp Message
                      </button>
                    </div>

                    <div className="mt-3">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Message template</label>
                      {waMessage?.trim() ? (
                        <textarea
                          rows={6}
                          value={waMessage}
                          onChange={(e) => setWaMessage(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 resize-none"
                          placeholder="Enter your message..."
                        />
                      ) : (
                        <div className="border border-dashed border-gray-200 rounded-lg p-4 text-sm text-gray-500 bg-gray-50">
                          Create a WhatsApp message to start outreach
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setCampaignStatus('active')}
                        disabled={updatingCampaignStatus}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Play size={14} /> Start Campaign
                      </button>
                      <button
                        type="button"
                        onClick={() => setCampaignStatus('paused')}
                        disabled={updatingCampaignStatus}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Pause size={14} /> Pause Campaign
                      </button>
                      <button
                        type="button"
                        onClick={() => setCampaignStatus('active')}
                        disabled={updatingCampaignStatus}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg border border-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <RotateCcw size={14} /> Resume Campaign
                      </button>
                    </div>
                  </div>

                  {/* Performance Metrics - Below Communication Section */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Performance</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Calls Made', value: performanceStats.calls, color: 'text-indigo-700' },
                        { label: 'WhatsApp Sent', value: performanceStats.waSent, color: 'text-green-700' },
                        { label: 'Replies Received', value: performanceStats.replies, color: 'text-blue-700' },
                        { label: 'Conversions', value: performanceStats.conversions, color: 'text-emerald-700' },
                      ].map((s) => (
                        <div key={s.label} className="bg-white border border-gray-100 rounded-[1rem] p-5 shadow-sm flex flex-col justify-center">
                          <h3 className={`text-2xl font-semibold tracking-tight leading-tight mb-1 ${s.color}`}>{s.value}</h3>
                          <p className="text-[13px] text-gray-500">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ─── Leads View (replaces details) ─── */
            <div>
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Leads</p>
                  <p className="text-sm text-gray-500 mt-1">All leads for this campaign</p>
                </div>
                {/* Sync from Facebook — only when Meta connected + lead form exists */}
                {isFacebookConnected && campaign?.metadata?.facebook_lead_form_id && (
                  <button
                    onClick={handleSyncFromFacebook}
                    disabled={syncingFbLeads}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1877F2] hover:bg-[#1565D8] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {syncingFbLeads ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw size={14} />}
                    {syncingFbLeads ? 'Syncing…' : 'Sync from Facebook'}
                  </button>
                )}
                {/* Sync from Google — only when Google connected + campaign published to Google */}
                {isGoogleConnected && campaign?.google_campaign_id && (
                  <button
                    onClick={handleSyncFromGoogle}
                    disabled={syncingGLeads}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#4285F4] hover:bg-[#3367D6] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {syncingGLeads ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw size={14} />}
                    {syncingGLeads ? 'Syncing…' : 'Sync from Google'}
                  </button>
                )}
              </div>

              {/* Reauth banner — Facebook */}
              {fbReauthNeeded && (
                <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800 flex-1">
                    Your Facebook connection has expired.
                    <a href="/settings/integrations/meta" className="ml-1 font-semibold underline hover:text-amber-900">Reconnect in Settings.</a>
                  </p>
                  <button onClick={() => setFbReauthNeeded(false)} className="text-amber-500 hover:text-amber-700 text-xs font-bold">✕</button>
                </div>
              )}

              {/* Reauth banner — Google */}
              {gReauthNeeded && (
                <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800 flex-1">
                    Your Google connection has expired.
                    <a href="/settings/integrations/google" className="ml-1 font-semibold underline hover:text-amber-900">Reconnect in Settings.</a>
                  </p>
                  <button onClick={() => setGReauthNeeded(false)} className="text-amber-500 hover:text-amber-700 text-xs font-bold">✕</button>
                </div>
              )}

              {/* Sync success toast — Facebook */}
              {fbSyncResult && (
                <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-sm text-emerald-800 font-medium">
                  ✓ Synced {fbSyncResult.synced} new lead{fbSyncResult.synced !== 1 ? 's' : ''} from Facebook
                  {fbSyncResult.skipped > 0 ? ` (${fbSyncResult.skipped} duplicate${fbSyncResult.skipped !== 1 ? 's' : ''} skipped)` : ''}
                </div>
              )}

              {/* Sync success toast — Google */}
              {gSyncResult && (
                <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-sm text-emerald-800 font-medium">
                  ✓ Synced {gSyncResult.synced} new lead{gSyncResult.synced !== 1 ? 's' : ''} from Google
                  {gSyncResult.skipped > 0 ? ` (${gSyncResult.skipped} duplicate${gSyncResult.skipped !== 1 ? 's' : ''} skipped)` : ''}
                </div>
              )}

              {/* Sync error toast — Facebook */}
              {fbSyncError && (
                <div className="mb-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700 font-medium">
                  {fbSyncError}
                </div>
              )}

              {/* Sync error toast — Google */}
              {gSyncError && (
                <div className="mb-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700 font-medium">
                  {gSyncError}
                </div>
              )}

              <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                <Filter size={14} className="text-gray-400 shrink-0" />
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3.5 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors shrink-0 ${
                      filter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
                <span className="ml-auto text-xs text-gray-400 font-medium shrink-0">
                  {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
                  {leadsLoading ? ' · syncing…' : ''}
                </span>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/70 text-xs text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-5 font-semibold min-w-[200px]">Name</th>
                        <th className="py-3 px-5 font-semibold min-w-[140px]">Phone</th>
                        <th className="py-3 px-5 font-semibold min-w-[160px]">Source</th>
                        <th className="py-3 px-5 font-semibold min-w-[130px]">AI Score</th>
                        <th className="py-3 px-5 font-semibold min-w-[140px]">Status</th>
                        <th className="py-3 px-5 font-semibold min-w-[200px]">Last Interaction</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-50">
                      {filteredLeads.map((l) => (
                        <tr
                          key={`${l.id}-${l.phone}-${l.name}`}
                          onClick={() => onLeadClick(l)}
                          className={`transition-colors ${l._linkToLead ? 'hover:bg-blue-50/40 cursor-pointer group' : 'hover:bg-gray-50'}`}
                        >
                          <td className="py-3.5 px-5">
                            <span className="font-semibold text-gray-900">{l.name || '—'}</span>
                          </td>
                          <td className="py-3.5 px-5 text-gray-600">{l.phone || '—'}</td>
                          <td className="py-3.5 px-5">
                            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                              {l.source || '—'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              scoreToLabel(l) === 'Hot'
                                ? 'bg-red-100 text-red-700'
                                : scoreToLabel(l) === 'Warm'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-sky-100 text-sky-700'
                            }`}>
                              {scoreToLabel(l)}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFilter(l.status === 'Won' ? 'Converted' : l.status);
                              }}
                              className="text-xs font-semibold text-gray-700 hover:text-blue-700 hover:underline"
                            >
                              {l.status === 'Won' ? 'Converted' : (l.status || '—')}
                            </button>
                          </td>
                          <td className="py-3.5 px-5 text-xs text-gray-500">{formatDate(l.lastActivity)}</td>
                        </tr>
                      ))}

                      {filteredLeads.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-14 text-center text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                              <Users size={34} className="text-gray-200" />
                              <p className="text-sm font-medium">No leads yet — add leads or connect marketing campaigns</p>
                              <p className="text-xs">Try a different filter or add your first lead.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SalesCampaignDetails;

