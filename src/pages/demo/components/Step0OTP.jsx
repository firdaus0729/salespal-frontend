import React, { useState, useRef, useEffect } from 'react';
import { Mail, Phone, ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Button from '../../../components/ui/Button';

const Step0OTP = ({ formData, updateFormData, onNext }) => {
    const [localEmail, setLocalEmail] = useState(formData.email || '');
    const [localPhone, setLocalPhone] = useState(formData.phone || '');
    const [status, setStatus] = useState('idle'); // idle | otp_sent | verifying | verified
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef([]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSendOTP = (e) => {
        if (e) e.preventDefault();
        if (!localEmail.trim() || !localPhone.trim()) return;

        setStatus('idle'); // Just to trigger a re-render
        // Show loader, then switch to otp_sent state
        setTimeout(() => {
            setStatus('otp_sent');
            setCountdown(30);
            updateFormData({ email: localEmail, phone: localPhone });
            // Auto focus first OTP input after a slight delay
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }, 1500); // simulate sending OTP delay
    };

    const handleVerify = (e) => {
        if (e) e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length < 6) return;

        setStatus('verifying');
        setTimeout(() => {
            setStatus('verified');
            setTimeout(() => {
                onNext();
            }, 1000);
        }, 1500);
    };

    const handleOtpChange = (index, value) => {
        if (!/^[0-9]*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto move next
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '').split('');
        const newOtp = [...otp];
        pastedData.forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
        if (pastedData.length > 0) {
            const nextIndex = Math.min(pastedData.length, 5);
            inputRefs.current[nextIndex]?.focus();
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
                <div className="mx-auto w-12 h-12 bg-blue-50 flex items-center justify-center rounded-full mb-4">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Verify Your Details to Start Demo</h2>
                <p className="text-gray-500 mt-2">We require verification to customize your AI agent's secure environment.</p>
            </div>

            {status === 'idle' && countdown === 0 && (
                <div className="space-y-4 max-w-sm mx-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                                placeholder="you@company.com"
                                value={localEmail}
                                onChange={(e) => setLocalEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                                placeholder="+1 (555) 000-0000"
                                value={localPhone}
                                onChange={(e) => setLocalPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            variant="primary"
                            onClick={() => handleSendOTP()}
                            disabled={!localEmail.trim() || !localPhone.trim()}
                            className="w-full py-3 flex justify-center"
                        >
                            Send OTP
                        </Button>
                    </div>
                </div>
            )}

            {(status === 'otp_sent' || status === 'verifying' || status === 'verified' || (status === 'idle' && countdown > 0)) && (
                <div className="space-y-6 max-w-sm mx-auto animate-fadeIn">
                    <p className="text-sm text-center text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        OTP sent to <span className="font-semibold text-gray-800">{localEmail}</span> and <span className="font-semibold text-gray-800">{localPhone}</span>.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter 6-Digit OTP</label>
                        <div className="flex justify-between gap-2" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-xl font-bold bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    disabled={status === 'verifying' || status === 'verified'}
                                />
                            ))}
                        </div>
                    </div>

                    {status === 'verified' ? (
                        <div className="flex items-center justify-center p-3 text-green-700 bg-green-50 rounded-xl border border-green-200 animate-fadeIn">
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            <span className="font-medium">Verification Successful!</span>
                        </div>
                    ) : (
                        <div className="space-y-4 pt-2">
                            <Button
                                variant="primary"
                                onClick={handleVerify}
                                disabled={otp.join('').length < 6 || status === 'verifying'}
                                className="w-full py-3 flex justify-center"
                            >
                                {status === 'verifying' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify OTP'
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    disabled={countdown > 0 || status === 'verifying'}
                                    onClick={handleSendOTP}
                                    className={`text-sm font-medium transition-colors ${countdown > 0 || status === 'verifying' ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
                                >
                                    {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Step0OTP;
