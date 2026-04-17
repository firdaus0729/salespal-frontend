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
        
        return {
            ...c,
            totalDue,
            amountPaid,
            remaining: Math.max(0, totalDue - amountPaid),
            dueDate: normalizedDate,
            lastContact: c.last_contact || c.lastContact,
            company: c.company || '',
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
            setDocuments(d || []);
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
            const created = await api.post('/post-sales/customers', {
                name: customer.name,
                phone: customer.phone || null,
                email: customer.email || null,
                company: customer.company || null,
                totalDue: customer.totalDue || customer.total_due || 0,
                amountPaid: customer.amountPaid || customer.amount_paid || 0,
                dueDate: customer.dueDate || customer.due_date || null,
                status: customer.status || 'active',
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
            const updated = await api.put(`/post-sales/customers/${id}`, updates);
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
            setPayments(prev => prev.map(p => p.id === id ? updated : p));
            return updated;
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
                status: doc.status || 'pending',
            });
            setDocuments(prev => [created, ...prev]);
            return created;
        } catch (err) {
            console.error('Error adding document:', err);
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
            customers, addCustomer, updateCustomer, deleteCustomer, getCustomer,
            // payments
            payments, addPayment, updatePaymentStatus,
            // automations
            automations, addAutomation, toggleAutomation, updateAutomation, deleteAutomation, getCustomerAutomations,
            // follow-ups
            followUps, addFollowUp, updateFollowUpStatus,
            // documents
            documents, addDocument,
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
