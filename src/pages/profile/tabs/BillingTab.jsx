import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Calendar, ArrowRight, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { getAccessToken } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';

const BillingTab = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [downloadSuccessId, setDownloadSuccessId] = useState(null);

    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

    const billingInfo = {
        plan: 'SalesPal 360',
        billingCycle: 'Monthly',
        nextBillingDate: 'March 14, 2026',
        paymentMethod: {
            type: 'Visa',
            last4: '4242'
        },
        amount: '₹99.00'
    };

    // Fetch invoices from backend
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getAccessToken();
        const response = await fetch(`${apiUrl}/api/invoices`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch invoices: ${response.statusText}`);
        }

        const data = await response.json();
        setInvoices(data.invoices || []);
      } catch (err) {
        console.error('[BillingTab] Fetch error:', err);
        setError(err.message || 'Failed to load billing history');
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    // Download invoice with progress & success animation
    const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
      try {
        setDownloadingId(invoiceId);
        setDownloadSuccessId(null);
        
        const token = getAccessToken();
        const response = await fetch(`${apiUrl}/api/invoice/${invoiceNumber || invoiceId}/download`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          showToast('Failed to download invoice', 'error');
          return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SalesPal_Invoice_${invoiceNumber || invoiceId}.pdf`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        // Show success state
        setDownloadSuccessId(invoiceId);
        showToast('Invoice Ready', 'success');
        
        // Clear success animation after 2 seconds
        setTimeout(() => {
          setDownloadSuccessId(null);
        }, 2000);
      } catch (err) {
        console.error('[BillingTab] Download error:', err);
        showToast('Failed to download invoice. Please try again.', 'error');
      } finally {
        setDownloadingId(null);
      }
    };

    // Fetch invoices on component mount
    useEffect(() => {
      fetchInvoices();
    }, []);

    // Format date
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };

    // Format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Plan & Billing Card */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Plan & Billing</h2>

                <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="flex items-start justify-between pb-6 border-b border-gray-200">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{billingInfo.plan}</h3>
                                <Badge variant="primary" className="text-xs">Active</Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                                {billingInfo.billingCycle} billing • {billingInfo.amount}/month
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/subscription')}
                        >
                            Change Plan
                        </Button>
                    </div>

                    {/* Next Billing Date */}
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Calendar size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Next Billing Date</p>
                            <p className="text-lg font-semibold text-gray-900">{billingInfo.nextBillingDate}</p>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                            <CreditCard size={24} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">Payment Method</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {billingInfo.paymentMethod.type} ending in {billingInfo.paymentMethod.last4}
                            </p>
                        </div>
                        <Button variant="ghost" size="sm">
                            Update
                        </Button>
                    </div>
                </div>

                {/* Manage Billing Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <Button
                        onClick={() => navigate('/subscription')}
                        className="w-full sm:w-auto"
                    >
                        Manage Billing
                        <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>
            </Card>

            {/* Billing History Card */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing History</h2>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="text-blue-600 animate-spin mr-3" />
                    <span className="text-gray-600">Loading billing history...</span>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={fetchInvoices}
                      className="mt-3"
                    >
                      Retry
                    </Button>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="p-8 text-center">
                    <CreditCard size={32} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-4">No billing history yet</p>
                    <p className="text-sm text-gray-500 mb-6">Complete your first purchase to see invoices here</p>
                    <Button onClick={() => navigate('/subscription')}>
                      View Plans
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              invoice.isLatest 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                                  invoice.isLatest
                                    ? 'bg-blue-100 border-blue-300'
                                    : 'bg-white border-gray-200'
                                }`}>
                                    <CreditCard size={20} className={invoice.isLatest ? 'text-blue-600' : 'text-gray-600'} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                                      {invoice.isLatest && (
                                        <Badge variant="primary" className="text-xs">Latest</Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500">{formatDate(invoice.date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</p>
                                    <Badge variant="success" className="text-xs mt-1">{invoice.status}</Badge>
                                </div>
                                
                                {/* Enhanced Download Button with Progress & Success Animation */}
                                <motion.div
                                    className="relative"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleDownloadInvoice(invoice.id, invoice.invoiceNumber)}
                                        disabled={downloadingId === invoice.id || downloadSuccessId === invoice.id}
                                        className="relative overflow-hidden"
                                    >
                                        {/* Progress Bar Background */}
                                        <AnimatePresence>
                                            {downloadingId === invoice.id && (
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent"
                                                    initial={{ x: '-100%' }}
                                                    animate={{ x: '100%' }}
                                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                                />
                                            )}
                                        </AnimatePresence>
                                        
                                        {/* Button Content */}
                                        <motion.span className="relative z-10 flex items-center gap-1.5">
                                            {downloadSuccessId === invoice.id ? (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                >
                                                    <Check size={16} className="text-green-600" />
                                                </motion.div>
                                            ) : downloadingId === invoice.id ? (
                                                <Loader2 size={16} className="animate-spin text-blue-600" />
                                            ) : null}
                                            <span>
                                                {downloadSuccessId === invoice.id ? 'Ready!' : downloadingId === invoice.id ? 'Downloading...' : 'Download'}
                                            </span>
                                        </motion.span>
                                    </Button>
                                    
                                    {/* Success Pulse Animation */}
                                    <AnimatePresence>
                                        {downloadSuccessId === invoice.id && (
                                            <motion.div
                                                className="absolute inset-0 rounded-lg border-2 border-green-500"
                                                initial={{ scale: 0.95, opacity: 1 }}
                                                animate={{ scale: 1.1, opacity: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.6 }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        </div>
                    ))}
                  </div>
                )}
            </Card>
        </div>
    );
};

export default BillingTab;
