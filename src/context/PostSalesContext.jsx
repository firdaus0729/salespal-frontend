import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const PostSalesContext = createContext();

export const PostSalesProvider = ({ children }) => {
    const { user } = useAuth();

    const [customers, setCustomers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [automations, setAutomations] = useState([]);
    const [followUps, setFollowUps] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [onboardingFlows, setOnboardingFlows] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Helper to normalize backend data to frontend camelCase
    const formatCustomer = (c) => {
        if (!c) return null;
        const totalDue = Number(c.total_due || c.totalDue || 0);
        const amountPaid = Number(c.amount_paid || c.amountPaid || 0);
        // Normalize date to YYYY-MM-DD
        const rawDate = c.due_date || c.dueDate;
        const normalizedDate = rawDate ? new Date(rawDate).toISOString().split('T')[0] : '';
        
        const metadata = c.metadata && typeof c.metadata === 'object' ? c.metadata : {};
        return {
            ...c,
            totalDue,
            amountPaid,
            remaining: Math.max(0, totalDue - amountPaid),
            dueDate: normalizedDate,
            lastContact: c.last_contact || c.lastContact,
            company: c.company || '',
            metadata,
            timezone: metadata.timezone || null,
            preferredLocale: metadata.preferredLocale || 'hing',
            autoLanguageSwitch: metadata.autoLanguageSwitch !== false,
            paymentStatus: metadata.paymentStatus || 'pending',
            documentStatus: metadata.documentStatus || 'pending',
            ownerConfirmed: metadata.ownerConfirmed || false,
            allRequirementsDone: metadata.allRequirementsDone || false,
            issueRemaining: metadata.issueRemaining || false,
            issueResolved: metadata.issueResolved || false,
            ratingScore: typeof metadata.ratingScore === 'number' ? metadata.ratingScore : null,
        };
    };

    // Helper to normalize payment data
    const formatPayment = (p) => {
        if (!p) return null;
        return {
            ...p,
            customerId: p.customer_id || p.customerId,
            amount: Number(p.amount || 0),
            paymentDate: (p.paid_at || p.paymentDate || p.created_at || '').split('T')[0],
            status: p.status || 'pending',
            dueDate: (p.due_date || p.dueDate || '').split('T')[0],
            invoiceId: p.invoice_id || p.invoiceId || `INV-${String(p.id || '').slice(0, 8).toUpperCase()}`,
        };
    };

    const formatDocument = (d) => {
        if (!d) return null;
        const status = d.status === 'approved' ? 'verified' : d.status;
        return {
            ...d,
            customerId: d.customer_id || d.customerId,
            uploadedAt: d.created_at || d.uploadedAt || null,
            status: status || 'pending',
        };
    };

    // ─── Fetch all data on mount ─────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        if (!user) { setLoading(false); return; }
        setLoading(true);
        try {
            const [c, p, a, f, d, o] = await Promise.all([
                api.get('/post-sales/customers'),
                api.get('/post-sales/payments'),
                api.get('/post-sales/automations'),
                api.get('/post-sales/followups'),
                api.get('/post-sales/documents'),
                api.get('/post-sales/onboarding'),
            ]);
            setCustomers((c || []).map(formatCustomer));
            setPayments((p || []).map(formatPayment));
            setAutomations(a || []);
            setFollowUps(f || []);
            setDocuments((d || []).map(formatDocument));
            setOnboardingFlows(o || []);
        } catch (err) {
            console.error('PostSales fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ─── CUSTOMERS ───────────────────────────────────────────────────────────
    const addCustomer = async (customer) => {
        try {
            const mergedMetadata = {
                ...(customer.metadata || {}),
                timezone: customer.timezone || customer.metadata?.timezone || null,
                preferredLocale: customer.preferredLocale || customer.metadata?.preferredLocale || 'hing',
                autoLanguageSwitch: customer.autoLanguageSwitch !== false,
                paymentStatus: customer.paymentStatus || customer.metadata?.paymentStatus || 'pending',
                documentStatus: customer.documentStatus || customer.metadata?.documentStatus || 'pending',
                ownerConfirmed: !!(customer.ownerConfirmed || customer.metadata?.ownerConfirmed),
                allRequirementsDone: !!(customer.allRequirementsDone || customer.metadata?.allRequirementsDone),
                issueRemaining: !!(customer.issueRemaining || customer.metadata?.issueRemaining),
                issueResolved: !!(customer.issueResolved || customer.metadata?.issueResolved),
                ratingScore: typeof customer.ratingScore === 'number' ? customer.ratingScore : customer.metadata?.ratingScore ?? null,
            };
            const created = await api.post('/post-sales/customers', {
                name: customer.name,
                phone: customer.phone || null,
                email: customer.email || null,
                company: customer.company || null,
                totalDue: customer.totalDue || customer.total_due || 0,
                amountPaid: customer.amountPaid || customer.amount_paid || 0,
                dueDate: customer.dueDate || customer.due_date || null,
                status: customer.status || 'active',
                metadata: mergedMetadata,
            });
            const formatted = formatCustomer(created);
            setCustomers(prev => [formatted, ...prev]);
            return formatted;
        } catch (err) {
            console.error('Error adding customer:', err);
            return null;
        }
    };

    const updateCustomer = async (id, updates) => {
        try {
            const current = customers.find(c => c.id === id);
            const mergedMetadata = updates?.metadata !== undefined
                ? updates.metadata
                : {
                    ...(current?.metadata || {}),
                    ...(updates.timezone !== undefined ? { timezone: updates.timezone } : {}),
                    ...(updates.preferredLocale !== undefined ? { preferredLocale: updates.preferredLocale } : {}),
                    ...(updates.autoLanguageSwitch !== undefined ? { autoLanguageSwitch: updates.autoLanguageSwitch } : {}),
                    ...(updates.paymentStatus !== undefined ? { paymentStatus: updates.paymentStatus } : {}),
                    ...(updates.documentStatus !== undefined ? { documentStatus: updates.documentStatus } : {}),
                    ...(updates.ownerConfirmed !== undefined ? { ownerConfirmed: updates.ownerConfirmed } : {}),
                    ...(updates.allRequirementsDone !== undefined ? { allRequirementsDone: updates.allRequirementsDone } : {}),
                    ...(updates.issueRemaining !== undefined ? { issueRemaining: updates.issueRemaining } : {}),
                    ...(updates.issueResolved !== undefined ? { issueResolved: updates.issueResolved } : {}),
                    ...(updates.ratingScore !== undefined ? { ratingScore: updates.ratingScore } : {}),
                };
            const updated = await api.put(`/post-sales/customers/${id}`, { ...updates, metadata: mergedMetadata });
            const formatted = formatCustomer(updated);
            setCustomers(prev => prev.map(c => c.id === id ? formatted : c));
            return formatted;
        } catch (err) {
            console.error('Error updating customer:', err);
        }
    };

    const deleteCustomer = async (id) => {
        try {
            await api.delete(`/post-sales/customers/${id}`);
            setCustomers(prev => prev.filter(c => c.id !== id));
            setPayments(prev => prev.filter(p => p.customer_id !== id));
            setFollowUps(prev => prev.filter(f => f.customer_id !== id));
            setDocuments(prev => prev.filter(d => d.customer_id !== id));
        } catch (err) {
            console.error('Error deleting customer:', err);
        }
    };

    const getCustomer = (id) => customers.find(c => c.id === id);
    const getMessageSuggestion = async (customerId, kind, latestUserMessage = '', history = []) => {
        try {
            const response = await api.post(`/post-sales/customers/${customerId}/message-suggestion`, {
                kind,
                latestUserMessage,
                history,
            });
            return response?.message || '';
        } catch (err) {
            console.error('Error fetching post-sales message suggestion:', err);
            return '';
        }
    };

    // ─── PAYMENTS ────────────────────────────────────────────────────────────
    const addPayment = async (payment) => {
        try {
            const created = await api.post('/post-sales/payments', {
                customerId: payment.customerId || payment.customer_id,
                amount: payment.amount,
                currency: payment.currency || 'INR',
                status: payment.status || 'pending',
                dueDate: payment.dueDate || payment.due_date || null,
                paymentMethod: payment.paymentMethod || null,
                notes: payment.notes || null,
            });
            const formatted = formatPayment(created);
            setPayments(prev => [formatted, ...prev]);
            return formatted;
        } catch (err) {
            console.error('Error adding payment:', err);
            return null;
        }
    };

    const updatePaymentStatus = async (id, status) => {
        try {
            const updated = await api.patch(`/post-sales/payments/${id}/status`, { status });
            const formatted = formatPayment(updated);
            setPayments(prev => prev.map(p => p.id === id ? formatted : p));
            return formatted;
        } catch (err) {
            console.error('Error updating payment status:', err);
        }
    };

    // ─── AUTOMATIONS ─────────────────────────────────────────────────────────
    const addAutomation = async (automation) => {
        try {
            const created = await api.post('/post-sales/automations', {
                name: automation.name,
                trigger: automation.trigger,
                action: automation.action,
                customerId: automation.customerId || automation.customer_id || null,
            });
            setAutomations(prev => [created, ...prev]);
            return created;
        } catch (err) {
            console.error('Error adding automation:', err);
            return null;
        }
    };

    const toggleAutomation = async (id) => {
        try {
            const updated = await api.patch(`/post-sales/automations/${id}/toggle`, {});
            setAutomations(prev => prev.map(a => a.id === id ? updated : a));
        } catch (err) {
            console.error('Error toggling automation:', err);
        }
    };

    const updateAutomation = async (id, updates) => {
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    };

    const getCustomerAutomations = (customerId) => automations.filter(a => a.customer_id === customerId);

    const deleteAutomation = async (id) => {
        try {
            await api.delete(`/post-sales/automations/${id}`);
            setAutomations(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Error deleting automation:', err);
        }
    };

    // ─── FOLLOW-UPS ──────────────────────────────────────────────────────────
    const addFollowUp = async (followUp) => {
        try {
            const created = await api.post('/post-sales/followups', {
                customerId: followUp.customerId || followUp.customer_id,
                task: followUp.task,
                dueAt: followUp.dueAt || followUp.due_at || null,
                notes: followUp.notes || null,
            });
            setFollowUps(prev => [created, ...prev]);
            return created;
        } catch (err) {
            console.error('Error adding follow-up:', err);
            return null;
        }
    };

    const updateFollowUpStatus = async (id, status) => {
        try {
            const updated = await api.patch(`/post-sales/followups/${id}/status`, { status });
            setFollowUps(prev => prev.map(f => f.id === id ? updated : f));
        } catch (err) {
            console.error('Error updating follow-up:', err);
        }
    };

    // ─── DOCUMENTS ───────────────────────────────────────────────────────────
    const addDocument = async (doc) => {
        try {
            const created = await api.post('/post-sales/documents', {
                customerId: doc.customerId || doc.customer_id,
                name: doc.name,
                type: doc.type || null,
                fileUrl: doc.fileUrl || null,
                status: doc.status === 'verified' ? 'approved' : (doc.status || 'pending'),
            });
            const formatted = formatDocument(created);
            setDocuments(prev => [formatted, ...prev]);
            return formatted;
        } catch (err) {
            console.error('Error adding document:', err);
            return null;
        }
    };

    const updateDocumentStatus = async (id, status) => {
        try {
            const backendStatus = status === 'verified' ? 'approved' : status;
            const updated = await api.patch(`/post-sales/documents/${id}/status`, { status: backendStatus });
            const formatted = formatDocument(updated);
            setDocuments(prev => prev.map(d => d.id === id ? formatted : d));
            return formatted;
        } catch (err) {
            console.error('Error updating document status:', err);
            return null;
        }
    };

    // ─── ONBOARDING ──────────────────────────────────────────────────────────
    const upsertOnboardingStep = async (customerId, stepName, stepOrder, status, notes) => {
        try {
            const updated = await api.post('/post-sales/onboarding', { customerId, stepName, stepOrder, status, notes });
            setOnboardingFlows(prev => {
                const existing = prev.findIndex(o => o.customer_id === customerId && o.step_name === stepName);
                if (existing >= 0) {
                    const next = [...prev];
                    next[existing] = updated;
                    return next;
                }
                return [...prev, updated];
            });
            return updated;
        } catch (err) {
            console.error('Error upserting onboarding step:', err);
        }
    };

    const getCustomerOnboarding = (customerId) => onboardingFlows.filter(o => o.customer_id === customerId);

    return (
        <PostSalesContext.Provider value={{
            loading,
            // customers
            customers, addCustomer, updateCustomer, deleteCustomer, getCustomer, getMessageSuggestion,
            // payments
            payments, addPayment, updatePaymentStatus,
            // automations
            automations, addAutomation, toggleAutomation, updateAutomation, deleteAutomation, getCustomerAutomations,
            // follow-ups
            followUps, addFollowUp, updateFollowUpStatus,
            // documents
            documents, addDocument, updateDocumentStatus,
            // onboarding
            onboardingFlows, upsertOnboardingStep, getCustomerOnboarding,
            // refresh
            refetch: fetchAll,
        }}>
            {children}
        </PostSalesContext.Provider>
    );
};

export const usePostSales = () => {
    const context = useContext(PostSalesContext);
    if (!context) throw new Error('usePostSales must be used within a PostSalesProvider');
    return context;
};
