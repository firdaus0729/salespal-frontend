import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, ShieldCheck, User, Loader2, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import Button from '../../../components/ui/Button';

const countryCodes = [
    { code: '+91', country: 'IN', flag: '🇮🇳', label: 'India (+91)', digits: 10 },
    { code: '+1', country: 'US', flag: '🇺🇸', label: 'USA (+1)', digits: 10 },
    { code: '+44', country: 'GB', flag: '🇬🇧', label: 'UK (+44)', digits: 10 },
    { code: '+971', country: 'AE', flag: '🇦🇪', label: 'UAE (+971)', digits: 9 },
    { code: '+65', country: 'SG', flag: '🇸🇬', label: 'Singapore (+65)', digits: 8 },
    { code: '+61', country: 'AU', flag: '🇦🇺', label: 'Australia (+61)', digits: 9 },
    { code: '+49', country: 'DE', flag: '🇩🇪', label: 'Germany (+49)', digits: 11 },
    { code: '+33', country: 'FR', flag: '🇫🇷', label: 'France (+33)', digits: 9 },
    { code: '+81', country: 'JP', flag: '🇯🇵', label: 'Japan (+81)', digits: 10 },
    { code: '+86', country: 'CN', flag: '🇨🇳', label: 'China (+86)', digits: 11 },
    { code: '+966', country: 'SA', flag: '🇸🇦', label: 'Saudi Arabia (+966)', digits: 9 },
    { code: '+974', country: 'QA', flag: '🇶🇦', label: 'Qatar (+974)', digits: 8 },
    { code: '+60', country: 'MY', flag: '🇲🇾', label: 'Malaysia (+60)', digits: 10 },
    { code: '+27', country: 'ZA', flag: '🇿🇦', label: 'South Africa (+27)', digits: 9 },
    { code: '+55', country: 'BR', flag: '🇧🇷', label: 'Brazil (+55)', digits: 11 },
    { code: '+52', country: 'MX', flag: '🇲🇽', label: 'Mexico (+52)', digits: 10 },
    { code: '+7', country: 'RU', flag: '🇷🇺', label: 'Russia (+7)', digits: 10 },
    { code: '+82', country: 'KR', flag: '🇰🇷', label: 'South Korea (+82)', digits: 10 },
    { code: '+39', country: 'IT', flag: '🇮🇹', label: 'Italy (+39)', digits: 10 },
    { code: '+34', country: 'ES', flag: '🇪🇸', label: 'Spain (+34)', digits: 9 },
];

const Step1Contact = ({ formData, updateFormData, onNext }) => {
    const [localName, setLocalName] = useState(formData.name || '');
    const [localEmail, setLocalEmail] = useState(formData.email || '');
    const [localPhone, setLocalPhone] = useState(formData.phone?.replace(/^\+\d+\s?/, '') || '');
    const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]); // India by default
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | otp_sent | verifying | verified
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef([]);
    const dropdownRef = useRef(null);

    // Track which fields have been touched (for showing errors only after interaction)
    const [touched, setTouched] = useState({ name: false, email: false, phone: false });
    // Track if user has attempted to submit
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    // --- Validation Logic ---
    const nameValidation = (() => {
        const trimmed = localName.trim();
        if (trimmed.length === 0) return { valid: false, error: 'Full name is required' };
        if (trimmed.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
        if (!/^[a-zA-Z\s.\-']+$/.test(trimmed)) return { valid: false, error: 'Name can only contain letters, spaces, dots, hyphens, and apostrophes' };
        return { valid: true, error: '' };
    })();

    const emailValidation = (() => {
        const trimmed = localEmail.trim();
        if (trimmed.length === 0) return { valid: false, error: 'Email address is required' };
        // RFC 5322 simplified regex — checks for proper format including TLD
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
        if (!emailRegex.test(trimmed)) return { valid: false, error: 'Please enter a valid email (e.g. name@company.com)' };
        return { valid: true, error: '' };
    })();

    const phoneValidation = (() => {
        const digitsOnly = localPhone.replace(/\D/g, '');
        if (digitsOnly.length === 0) return { valid: false, error: 'Phone number is required' };

        const expectedDigits = selectedCountry.digits;

        if (selectedCountry.code === '+91') {
            // Indian mobile numbers: must start with 6-9, exactly 10 digits
            if (digitsOnly.length !== 10) return { valid: false, error: `Indian mobile number must be exactly 10 digits` };
            if (!/^[6-9]/.test(digitsOnly)) return { valid: false, error: 'Indian mobile number must start with 6, 7, 8, or 9' };
        } else {
            // For other countries: check digit count range (allow ±1 from expected)
            if (digitsOnly.length < expectedDigits - 1 || digitsOnly.length > expectedDigits + 1) {
                return { valid: false, error: `Phone number for ${selectedCountry.country} should be around ${expectedDigits} digits` };
            }
        }

        return { valid: true, error: '' };
    })();

    const isValidName = nameValidation.valid;
    const isValidEmail = emailValidation.valid;
    const isValidPhone = phoneValidation.valid;
    const allValid = isValidName && isValidEmail && isValidPhone;

    // Close country dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowCountryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Format the full phone number with country code for storage
    const getFullPhone = () => `${selectedCountry.code} ${localPhone.replace(/\D/g, '')}`;

    const handlePhoneChange = (e) => {
        const raw = e.target.value;
        // Only allow digits, spaces, and hyphens for formatting
        const cleaned = raw.replace(/[^\d\s\-]/g, '');
        setLocalPhone(cleaned);
        updateFormData({ phone: `${selectedCountry.code} ${cleaned.replace(/\D/g, '')}` });
    };

    const handleSendOTP = (e) => {
        if (e) e.preventDefault();
        setAttemptedSubmit(true);
        setTouched({ name: true, email: true, phone: true });

        if (!allValid) return;

        setStatus('idle'); // Trigger re-render
        setTimeout(() => {
            setStatus('otp_sent');
            setCountdown(30);
            updateFormData({ name: localName, email: localEmail, phone: getFullPhone() });
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }, 1500);
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

    const shouldShowError = (field) => touched[field] || attemptedSubmit;

    const getInputBorderClass = (isValid, field) => {
        if (isValid) return 'border-green-300 focus:ring-green-500';
        if (shouldShowError(field)) return 'border-red-300 focus:ring-red-500';
        return 'border-gray-300 focus:ring-blue-500';
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
                <div className="mx-auto w-12 h-12 bg-blue-50 flex items-center justify-center rounded-full mb-4">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Verify Your Details</h2>
                <p className="text-gray-500 mt-2">Let's get you set up for the live AI demo.</p>
            </div>

            {status === 'idle' && countdown === 0 && (
                <div className="space-y-4 max-w-sm mx-auto">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                className={`w-full pl-10 pr-10 py-3 rounded-xl border ${getInputBorderClass(isValidName, 'name')} focus:ring-2 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]`}
                                placeholder="Jane Doe"
                                value={localName}
                                onChange={(e) => { setLocalName(e.target.value); updateFormData({ name: e.target.value }); }}
                                onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                            />
                            {isValidName && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </motion.div>
                            )}
                            {!isValidName && shouldShowError('name') && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                </motion.div>
                            )}
                        </div>
                        <AnimatePresence>
                            {!isValidName && shouldShowError('name') && localName.length > 0 && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                                >
                                    <AlertCircle className="w-3 h-3 shrink-0" /> {nameValidation.error}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                className={`w-full pl-10 pr-10 py-3 rounded-xl border ${getInputBorderClass(isValidEmail, 'email')} focus:ring-2 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]`}
                                placeholder="you@company.com"
                                value={localEmail}
                                onChange={(e) => { setLocalEmail(e.target.value); updateFormData({ email: e.target.value }); }}
                                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                            />
                            {isValidEmail && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </motion.div>
                            )}
                            {!isValidEmail && shouldShowError('email') && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                </motion.div>
                            )}
                        </div>
                        <AnimatePresence>
                            {!isValidEmail && shouldShowError('email') && localEmail.length > 0 && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                                >
                                    <AlertCircle className="w-3 h-3 shrink-0" /> {emailValidation.error}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Phone with Country Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            {/* Country Code Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                    className="flex items-center gap-1.5 h-full px-3 py-3 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 min-w-[90px]"
                                >
                                    <span className="text-base">{selectedCountry.flag}</span>
                                    <span>{selectedCountry.code}</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                </button>

                                <AnimatePresence>
                                    {showCountryDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto w-[220px]"
                                        >
                                            {countryCodes.map((cc) => (
                                                <button
                                                    key={cc.code + cc.country}
                                                    onClick={() => {
                                                        setSelectedCountry(cc);
                                                        setShowCountryDropdown(false);
                                                        updateFormData({ phone: `${cc.code} ${localPhone.replace(/\D/g, '')}` });
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center gap-3 ${selectedCountry.code === cc.code ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                                        }`}
                                                >
                                                    <span className="text-base">{cc.flag}</span>
                                                    <span className="truncate">{cc.label}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Phone Input */}
                            <div className="relative flex-1">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    className={`w-full pl-10 pr-10 py-3 rounded-xl border ${getInputBorderClass(isValidPhone, 'phone')} focus:ring-2 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]`}
                                    placeholder={selectedCountry.code === '+91' ? '98765 43210' : 'Phone number'}
                                    value={localPhone}
                                    onChange={handlePhoneChange}
                                    onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                                    maxLength={selectedCountry.digits + 3} // allow spaces/hyphens
                                />
                                {isValidPhone && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    </motion.div>
                                )}
                                {!isValidPhone && shouldShowError('phone') && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                    </motion.div>
                                )}
                            </div>
                        </div>
                        <AnimatePresence>
                            {!isValidPhone && shouldShowError('phone') && localPhone.length > 0 && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                                >
                                    <AlertCircle className="w-3 h-3 shrink-0" /> {phoneValidation.error}
                                </motion.p>
                            )}
                        </AnimatePresence>
                        <p className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            AI will call this number instantly for demo
                        </p>
                    </div>

                    {/* Submit Error Summary */}
                    <AnimatePresence>
                        {attemptedSubmit && !allValid && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>Please fix the errors above before continuing.</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="pt-4">
                        <Button
                            variant="primary"
                            onClick={() => handleSendOTP()}
                            disabled={attemptedSubmit && !allValid}
                            className="w-full py-3 flex justify-center"
                        >
                            Send Verification OTP
                        </Button>
                    </div>
                </div>
            )}

            {(status === 'otp_sent' || status === 'verifying' || status === 'verified' || (status === 'idle' && countdown > 0)) && (
                <div className="space-y-6 max-w-sm mx-auto animate-fadeIn">
                    <p className="text-sm text-center text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        OTP sent to <span className="font-semibold text-gray-800">{getFullPhone()}</span>.
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

export default Step1Contact;
