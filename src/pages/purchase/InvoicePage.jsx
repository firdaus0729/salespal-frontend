import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAccessToken } from '../../lib/api';
import { 
    Download, 
    Printer, 
    Check, 
    AlertCircle, 
    Mail, 
    Globe, 
    MapPin, 
    ShieldCheck,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import Button from '../../components/ui/Button';
import api from '../../lib/api';

/**
 * Premium SaaS Invoice Component
 * Targeted for multi-million dollar SaaS aesthetics
 */

const InvoiceHeader = ({ id, date, status }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-10 border-b border-gray-100 mb-10">
        <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-4">
                <img src="/BlackTextLogo.webp" alt="SalesPal" className="h-10 object-contain" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">SalesPal Inc.</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail size={12} />
                    <span>billing@salespal.ai</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Globe size={12} />
                    <span>www.salespal.ai</span>
                </div>
            </div>
        </div>
        
        <div className="text-left md:text-right">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2 uppercase">Invoice</h1>
            <div className="space-y-1 mb-4">
                <p className="text-sm font-medium text-gray-900">#{id}</p>
                <p className="text-xs text-gray-500">Issued on {date}</p>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${
                status === 'PAID' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                {status}
            </div>
        </div>
    </div>
);

const BillingSection = ({ customer, from }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10 pb-10 border-b border-gray-100">
        <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Billed To</h3>
            <div className="space-y-1">
                <p className="text-base font-bold text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-600">{customer.email}</p>
                <p className="text-xs text-gray-400 mt-2">USER ID: {customer.id}</p>
            </div>
        </div>
        
        <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">From</h3>
            <div className="space-y-1">
                <p className="text-base font-bold text-gray-900">SalesPal Inc.</p>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="mt-1 shrink-0 text-gray-400" />
                    <span>123 Revenue Avenue, Suite 500<br/>San Francisco, CA 94103</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShieldCheck size={14} className="text-gray-400" />
                    <span>Support: help@salespal.ai</span>
                </div>
            </div>
        </div>
    </div>
);

const InvoiceTable = ({ items }) => (
    <div className="mb-10 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-gray-100">
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Product / Service</th>
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Qty</th>
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Unit Price</th>
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50/50">
                        <td className="py-6 pr-4">
                            <p className="text-sm font-bold text-gray-900 mb-0.5">{item.name}</p>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">{item.description}</p>
                        </td>
                        <td className="py-6 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="py-6 text-sm text-gray-900 text-right">₹{item.price.toLocaleString()}</td>
                        <td className="py-6 text-sm font-bold text-gray-900 text-right">₹{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PricingSummary = ({ subtotal, tax, discount, total }) => (
    <div className="flex justify-end mb-16">
        <div className="w-full md:w-80 space-y-3">
            <div className="flex justify-between text-sm py-1">
                <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Subtotal</span>
                <span className="text-gray-900 font-medium">₹{subtotal.toLocaleString()}</span>
            </div>
            {tax > 0 && (
                <div className="flex justify-between text-sm py-1">
                    <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Tax (0%)</span>
                    <span className="text-gray-900 font-medium">₹{tax.toLocaleString()}</span>
                </div>
            )}
            {discount > 0 && (
                <div className="flex justify-between text-sm py-1 text-emerald-600">
                    <span className="uppercase tracking-wider text-[10px] font-bold">Discount</span>
                    <span className="font-medium">-₹{discount.toLocaleString()}</span>
                </div>
            )}
            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-xs uppercase tracking-[0.2em] font-black text-gray-900">Total Amount</span>
                <span className="text-2xl font-black text-gray-900">₹{total.toLocaleString()}.00</span>
            </div>
        </div>
    </div>
);

const PaymentStatus = ({ method, date, transactionId }) => (
    <div className="bg-gray-50 rounded-2xl p-6 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-gray-100/50">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Check className="text-emerald-500 w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Paid via</p>
                <p className="text-sm font-bold text-gray-900">{method}</p>
            </div>
        </div>
        
        <div className="flex gap-12">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Payment Date</p>
                <p className="text-sm font-bold text-gray-900">{date}</p>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Transaction ID</p>
                <p className="text-xs font-mono font-medium text-gray-500">{transactionId}</p>
            </div>
        </div>
    </div>
);

const InvoiceFooter = () => (
    <div className="text-center pt-8 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-900 mb-2">Thank you for building the future with SalesPal.</p>
        <p className="text-xs text-gray-400 mb-6">Need assistance? Reach out to support@salespal.ai</p>
        <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-gray-50 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100">
            <AlertCircle size={12} />
            This is a system-generated invoice and does not require a signature.
        </div>
    </div>
);

const InvoicePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const paymentId = searchParams.get('id');

    // Fetch payment data from API
    useEffect(() => {
        const fetchPaymentData = async () => {
            if (!paymentId) {
                setError('No payment ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log('Fetching payment data for ID:', paymentId);
                const response = await api.get(`/api/payment/${paymentId}`);
                console.log('Payment data response:', response);
                
                if (response.success && response.payment) {
                    // Parse items if it's a string
                    const items = typeof response.payment.items === 'string' 
                        ? JSON.parse(response.payment.items)
                        : response.payment.items || [];

                    // Calculate totals
                    const subtotal = items.reduce((sum, item) => {
                        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                        const quantity = item.quantity || 1;
                        return sum + (price * quantity);
                    }, 0);

                    setPaymentData({
                        id: response.payment.id,
                        invoiceNumber: response.payment.invoice_number,
                        amount: response.payment.amount || subtotal,
                        items: items,
                        status: response.payment.status || 'PAID',
                        method: response.payment.method || 'Razorpay',
                        date: response.payment.date,
                        transactionId: response.payment.transactionId,
                        subtotal: subtotal,
                        tax: 0,
                        discount: 0,
                        total: response.payment.amount || subtotal,
                    });
                    setError(null);
                } else {
                    setError('Failed to load payment details');
                }
            } catch (err) {
                console.error('Error fetching payment:', err);
                // Extract error message from various error formats
                let errorMsg = 'Failed to fetch payment data';
                if (err.message) errorMsg = err.message;
                if (err.status === 404) errorMsg = 'Invoice not found. Payment ID may be invalid.';
                if (err.status === 403) errorMsg = 'You do not have access to this invoice.';
                if (err.status === 500) errorMsg = 'Server error. Please try again later.';
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentData();
    }, [paymentId]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        if (!paymentData) return;
        
        try {
            setIsDownloading(true);
            // Download PDF from dedicated invoice endpoint
            const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
            const token = getAccessToken();
            const identifier = paymentData.invoiceNumber || paymentData.id;
            const response = await fetch(`${apiUrl}/api/invoice/${identifier}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to download invoice');
            }

            // Create blob and trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `SalesPal_Invoice_${identifier}.pdf`;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download invoice. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                    <p className="text-gray-600">Loading invoice...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !paymentData) {
        return (
            <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <h2 className="text-xl font-bold text-gray-900">Failed to Load Invoice</h2>
                    <p className="text-gray-600">{error || 'The requested invoice could not be found.'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Get user data (you might want to fetch this from auth context)
    const userData = {
        name: 'Customer',
        email: 'customer@example.com',
        id: 'USR_' + Math.random().toString(36).substr(2, 6).toUpperCase()
    };

    // Mock data structure for invoice components
    const data = {
        id: paymentData.invoiceNumber || `INV-2026-${paymentData.id?.substring(0, 6).toUpperCase()}`,
        date: new Date(paymentData.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        status: paymentData.status,
        customer: userData,
        items: paymentData.items.length > 0 ? paymentData.items : [
            {
                name: 'SalesPal Subscription',
                description: 'Monthly subscription to SalesPal platform',
                quantity: 1,
                price: paymentData.amount
            }
        ],
        subtotal: paymentData.subtotal,
        tax: paymentData.tax,
        discount: paymentData.discount,
        total: paymentData.total,
        payment: {
            method: paymentData.method,
            date: paymentData.date,
            transactionId: paymentData.transactionId
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] py-20 px-4">
            {/* Action Bar (Not visible when printing) */}
            <div className="max-w-[900px] mx-auto mb-8 flex justify-between items-center gap-3 print:hidden flex-wrap">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
                <div className="flex gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={handlePrint}
                        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Printer size={16} />
                        Print Invoice
                    </Button>
                    <Button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download size={16} />
                                Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Main Invoice Card */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[900px] mx-auto bg-white rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.06)] border border-gray-100 p-8 md:p-16 relative overflow-hidden"
            >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none"></div>
                
                <InvoiceHeader id={data.id} date={data.date} status={data.status} />
                
                <BillingSection customer={data.customer} from={data.from} />
                
                <InvoiceTable items={data.items} />
                
                <PricingSummary 
                    subtotal={data.subtotal} 
                    tax={data.tax} 
                    discount={data.discount} 
                    total={data.total} 
                />
                
                <PaymentStatus 
                    method={data.payment.method} 
                    date={data.payment.date} 
                    transactionId={data.payment.transactionId} 
                />
                
                <InvoiceFooter />
                
                {/* Print Safety Label */}
                <p className="text-[10px] text-center text-gray-300 mt-12 hidden print:block">
                    © 2026 SalesPal Inc. • Securely generated for {data.customer.email}
                </p>
            </motion.div>

            <style>{`
                @media print {
                    body { background: white !important; margin: 0; padding: 0; }
                    .min-h-screen { min-height: auto; padding: 0 !important; margin: 0 !important; }
                    .max-w-[900px] { max-width: 100% !important; border: none !important; shadow: none !important; margin: 0 !important; padding: 0 !important; }
                    button, .print-hide { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default InvoicePage;
