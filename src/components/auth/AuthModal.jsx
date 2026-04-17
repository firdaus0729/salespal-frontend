import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [signUpSuccess, setSignUpSuccess] = useState(false);

    const { login, signup, loginWithGoogle } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setError('');
            setSignUpSuccess(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                if (onSuccess) onSuccess();
                onClose();
            } else {
                await signup(email, password, fullName);
                setSignUpSuccess(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-9998"
                        transition={{ duration: 0.2 }}
                    />

                    {/* Modal Scroll Container */}
                    <div className="fixed inset-0 z-9999 overflow-y-auto" onClick={onClose}>
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-[420px]"
                            >
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="p-8 pt-10">
                                    {signUpSuccess ? (
                                        <div className="text-center py-4">
                                            <div className="text-4xl mb-4">✉️</div>
                                            <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                                            <p className="text-gray-500 text-sm mb-6">
                                                We sent a confirmation link to <span className="font-semibold text-blue-600">{email}</span>.
                                                Click it to activate your account.
                                            </p>
                                            <button
                                                onClick={() => { setIsLogin(true); setSignUpSuccess(false); }}
                                                className="text-blue-600 font-semibold hover:text-blue-700 text-sm"
                                            >
                                                Back to Sign In
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-center mb-8">
                                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                                    {isLogin ? 'Welcome Back' : 'Create Account'}
                                                </h2>
                                                <p className="text-gray-500 text-sm">
                                                    {isLogin ? 'Sign in to access all features' : 'Start your free trial'}
                                                </p>
                                            </div>

                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                {error && (
                                                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2">
                                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                        <span>{error}</span>
                                                    </div>
                                                )}

                                                <div className="space-y-4">
                                                    {!isLogin && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Full Name</label>
                                                            <div className="relative group">
                                                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                                                <input
                                                                    type="text"
                                                                    value={fullName}
                                                                    onChange={(e) => setFullName(e.target.value)}
                                                                    placeholder="John Doe"
                                                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email</label>
                                                        <div className="relative group">
                                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                                            <input
                                                                type="email"
                                                                value={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                                placeholder="you@company.com"
                                                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Password</label>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                                            <input
                                                                type="password"
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                                placeholder="••••••••"
                                                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                                                                required
                                                                minLength={6}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    className="w-full py-3 h-12 text-[15px] font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 mt-2"
                                                    disabled={loading}
                                                >
                                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                                                </Button>

                                                <div className="relative mt-6 mb-4">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-gray-200"></div>
                                                    </div>
                                                    <div className="relative flex justify-center text-sm">
                                                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-center w-full mt-4">
                                                    <GoogleLogin
                                                        onSuccess={async (credentialResponse) => {
                                                            try {
                                                                setError('');
                                                                setLoading(true);
                                                                await loginWithGoogle(credentialResponse.credential);
                                                                if (onSuccess) onSuccess();
                                                                onClose();
                                                            } catch (err) {
                                                                setError(err.message);
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        onError={() => {
                                                            setError('Google Login Failed');
                                                        }}
                                                        theme="outline"
                                                        size="large"
                                                        text={isLogin ? "signin_with" : "signup_with"}
                                                        width="356"
                                                    />
                                                </div>
                                            </form>

                                            <div className="mt-8 text-center border-t border-gray-100 pt-6">
                                                <p className="text-gray-600 text-sm">
                                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                                    <button
                                                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                                        className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                                                    >
                                                        {isLogin ? 'Sign up' : 'Sign in'}
                                                    </button>
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AuthModal;
