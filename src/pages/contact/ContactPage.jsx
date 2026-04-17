import React, { useState } from 'react';

import Button from '../../components/ui/Button';
import { Mail, Phone, MapPin, Calendar, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: ''
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        // Basic validation
        if (!formData.name || !formData.email || !formData.message) {
            setStatus({ type: 'error', message: 'Please fill in all required fields.' });
            setIsSubmitting(false);
            return;
        }

        // Simulate API call
        setTimeout(() => {
            setStatus({ type: 'success', message: 'Message sent successfully!' });
            setFormData({
                name: '',
                email: '',
                company: '',
                phone: '',
                message: ''
            });
            setIsSubmitting(false);

            // Clear success message after 5 seconds
            setTimeout(() => {
                setStatus({ type: '', message: '' });
            }, 5000);
        }, 1500);
    };

    return (
        <div className="pt-16 pb-20 px-6 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                        Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">Talk</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Ready to automate your revenue? Try our AI live or send us a message. We typically respond within a few hours.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

                    {/* Left Column: Contact Form */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Send us a message</h2>

                        {status.message && (
                            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                <span className="text-sm font-medium">{status.message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label htmlFor="name" className="text-sm font-semibold text-slate-700">Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your name"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@company.com"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="company" className="text-sm font-semibold text-slate-700">Company</label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="Your company name"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="message" className="text-sm font-semibold text-slate-700">Message <span className="text-red-500">*</span></label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Tell us about your business and what you're looking for..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 text-sm resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.99]"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                    </div>

                    {/* Right Column: Info Cards */}
                    <div className="space-y-6">

                        {/* Contact Info Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h2>
                            <div className="space-y-6">

                                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100/50">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-0.5 uppercase tracking-wide">Email</p>
                                        <a href="mailto:dharmendar@salespal.in" className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors">
                                            dharmendar@salespal.in
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100/50">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-0.5 uppercase tracking-wide">Phone</p>
                                        <a href="tel:+919322558893" className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors">
                                            +91 9322558893
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100/50">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-0.5 uppercase tracking-wide">Location</p>
                                        <p className="text-sm font-medium text-slate-900">
                                            India
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Try AI Live Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-bold text-slate-900">Try AI Live</h2>
                            </div>
                            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                Schedule a 15-minute call to see SalesPal in action. Our team will show you how AI can transform your revenue operations.
                            </p>

                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 text-center">
                                <p className="text-xs font-medium text-slate-500 mb-4">
                                    Try the interactive AI Demo experience now.
                                </p>
                                <Link
                                    to="/demo"
                                    className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-full hover:shadow-lg hover:shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                                >
                                    Start Interactive Demo
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
