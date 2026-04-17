import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Megaphone, Plus, X, Loader2, ArrowRight, Calendar, Users, Activity, Upload, Trash2, Globe } from 'lucide-react';
import api from '../../lib/api';
import { useSubscription } from '../../commerce/SubscriptionContext';

const STATUS_BADGE = {
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-gray-200 text-gray-700',
  draft: 'bg-blue-100 text-blue-700',
};

const formatStatus = (s) => {
  if (!s) return '—';
  const v = String(s).toLowerCase();
  if (v === 'active') return 'Active';
  if (v === 'paused') return 'Paused';
  if (v === 'completed') return 'Completed';
  if (v === 'draft') return 'Draft';
  return v.charAt(0).toUpperCase() + v.slice(1);
};

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString();
};

const SalesCampaigns = () => {
  const navigate = useNavigate();
  const { isModuleActive, loading: subLoading } = useSubscription();
  const hasMarketing = isModuleActive('marketing');

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', source: 'Manual', description: '', websiteUrl: '' });
  const [assets, setAssets] = useState([]);
  const [creating, setCreating] = useState(false);
  const [fetchingWebsite, setFetchingWebsite] = useState(false);

  const fetchCampaigns = async () => {
    if (!hasMarketing) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/marketing/campaigns');
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!subLoading) fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subLoading, hasMarketing]);

  const fetchWebsiteData = async () => {
    if (!form.websiteUrl.trim()) return;
    setFetchingWebsite(true);
    try {
      const urlToFetch = form.websiteUrl.includes('://') 
        ? form.websiteUrl 
        : `https://${form.websiteUrl}`;
      const data = await api.get(`/utils/fetch-website-data?url=${encodeURIComponent(urlToFetch.trim())}`);
      if (data?.description && !form.description) {
        setForm(p => ({ ...p, description: data.description }));
      }
    } catch (e) {
      console.error('Failed to fetch website data:', e);
    } finally {
      setFetchingWebsite(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      const isImage = f.type.startsWith('image/');
      const isPdf = f.type === 'application/pdf';
      return isImage || isPdf;
    });
    setAssets(prev => [...prev, ...validFiles]);
  };

  const removeAsset = (index) => {
    setAssets(prev => prev.filter((_, i) => i !== index));
  };

  const isValidUrl = (url) => {
    if (!url || !url.trim()) return false;
    try {
      // Add https:// if no protocol is provided
      const urlToValidate = url.includes('://') ? url : `https://${url}`;
      new URL(urlToValidate);
      return true;
    } catch {
      return false;
    }
  };

  const sorted = useMemo(() => {
    return [...campaigns].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [campaigns]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setCreating(true);
    try {
      let websiteUrl = form.websiteUrl?.trim() || null;
      // Append https:// to URL if no protocol specified
      if (websiteUrl && !websiteUrl.includes('://')) {
        websiteUrl = `https://${websiteUrl}`;
      }

      const payload = {
        name: form.name.trim(),
        source: form.source,
        description: form.description?.trim() || null,
        websiteUrl: websiteUrl,
      };

      let created = null;
      
      // If there are assets, use FormData
      if (assets.length > 0) {
        const formData = new FormData();
        formData.append('name', payload.name);
        formData.append('source', payload.source);
        formData.append('description', payload.description);
        formData.append('websiteUrl', payload.websiteUrl);
        assets.forEach(file => {
          formData.append('assets', file);
        });

        try {
          created = await api.post('/sales/campaigns/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch {
          created = await api.post('/marketing/campaigns', {
            name: payload.name,
            platform: payload.source === 'WhatsApp' ? 'whatsapp' : payload.source === 'Calls' ? 'calls' : payload.source === 'Ads' ? 'ads' : 'manual',
            status: 'draft',
            metadata: {
              description: payload.description,
              websiteUrl: payload.websiteUrl,
              created_from: 'sales'
            },
          });
        }
      } else {
        try {
          created = await api.post('/sales/campaigns/create', payload);
        } catch {
          created = await api.post('/marketing/campaigns', {
            name: payload.name,
            platform: payload.source === 'WhatsApp' ? 'whatsapp' : payload.source === 'Calls' ? 'calls' : payload.source === 'Ads' ? 'ads' : 'manual',
            status: 'draft',
            metadata: {
              description: payload.description,
              websiteUrl: payload.websiteUrl,
              created_from: 'sales'
            },
          });
        }
      }

      setCreateOpen(false);
      setForm({ name: '', source: 'Manual', description: '', websiteUrl: '' });
      setAssets([]);
      if (created?.id) {
        setCampaigns((prev) => [created, ...prev]);
      } else {
        await fetchCampaigns();
      }
    } finally {
      setCreating(false);
    }
  };

  const openCampaign = (c) => {
    navigate(`/sales/campaigns/${c.id}`);
  };

  return (
    <div className="font-sans text-gray-900 pb-12">
      <AnimatePresence>
        {createOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setCreateOpen(false)}
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
                  <Megaphone size={16} className="text-blue-600" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Create Campaign</p>
                    <p className="text-xs text-gray-500">Add a campaign to track leads inside Sales</p>
                  </div>
                </div>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Campaign Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Summer Offers 2026"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Source</label>
                    <select
                      value={form.source}
                      onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    >
                      <option>Manual</option>
                      <option>WhatsApp</option>
                      <option>Calls</option>
                      <option>Ads</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Description (optional)</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Add a short note about this campaign..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Website URL (optional)</label>
                  <div className="flex items-center gap-2">
                    <input
                      value={form.websiteUrl}
                      onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))}
                      placeholder="example.com or https://example.com"
                      type="text"
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={fetchWebsiteData}
                      disabled={!isValidUrl(form.websiteUrl) || fetchingWebsite}
                      className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                    >
                      {fetchingWebsite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe size={14} />}
                      Fetch
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Campaign Assets (optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Upload size={14} />
                        <span>Upload images or PDF documents</span>
                      </div>
                    </label>
                  </div>
                  
                  {assets.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {assets.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {file.type.startsWith('image/') ? (
                              <div className="w-8 h-8 rounded bg-gray-200 flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">PDF</div>
                            )}
                            <span className="text-xs text-gray-700 truncate">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAsset(idx)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                          >
                            <Trash2 size={14} className="text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !form.name.trim()}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={14} />}
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Campaigns
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Track campaign performance and leads inside Sales.</p>
        </div>
        <button
          onClick={() => (hasMarketing ? setCreateOpen(true) : (window.location.href = '/#pricing'))}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {!hasMarketing && !subLoading && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Megaphone size={22} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Marketing module required to view campaigns</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Unlock Marketing to sync campaigns and track leads inside Sales.
          </p>
          <button
            onClick={() => (window.location.href = '/#pricing')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Unlock Marketing <ArrowRight size={14} />
          </button>
        </div>
      )}

      {hasMarketing && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Campaign list</p>
            {loading && (
              <span className="text-xs text-gray-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading
              </span>
            )}
          </div>

          {error && (
            <div className="px-5 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">
              {error}
            </div>
          )}

          {!loading && sorted.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <Megaphone size={20} />
              </div>
              <p className="text-gray-900 font-bold">Create your first campaign to start tracking leads</p>
              <p className="text-sm text-gray-500 mt-1 mb-6">You can also connect Marketing campaigns to auto-sync leads.</p>
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-white text-xs text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-5 font-semibold min-w-[220px]">Campaign</th>
                    <th className="py-3 px-5 font-semibold min-w-[120px]">Status</th>
                    <th className="py-3 px-5 font-semibold min-w-[120px]">Leads</th>
                    <th className="py-3 px-5 font-semibold min-w-[170px]">Created</th>
                    <th className="py-3 px-5 font-semibold min-w-[170px]">Last activity</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {sorted.map((c) => {
                    const leadsCount = Number(c.leads_count ?? c.leadsCount ?? c.conversions ?? 0) || 0;
                    const lastActivity = c.updated_at || c.updatedAt || c.created_at;
                    const statusKey = String(c.status || 'draft').toLowerCase();

                    return (
                      <tr
                        key={c.id}
                        onClick={() => openCampaign(c)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                              <Megaphone size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                                {c.name || 'Untitled Campaign'}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {c.platform ? String(c.platform).toUpperCase() : '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[statusKey] || 'bg-gray-100 text-gray-700'}`}>
                            {formatStatus(statusKey)}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <Users size={12} className="text-gray-400" /> {leadsCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar size={12} className="text-gray-400" /> {formatDate(c.created_at || c.createdAt)}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                            <Activity size={12} className="text-gray-400" /> {formatDate(lastActivity)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesCampaigns;

