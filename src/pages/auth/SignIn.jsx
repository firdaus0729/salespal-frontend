import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../commerce/SubscriptionContext';
import { getDefaultModuleRoute } from '../../utils/navigationUtils';
import Button from '../../components/ui/Button';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [signUpSuccess, setSignUpSuccess] = useState(false);

    const { login, loginWithGoogle, signup, isAuthenticated } = useAuth();
    const { subscriptions, loading: subLoading } = useSubscription();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname;

    React.useEffect(() => {
        if (isAuthenticated && !subLoading) {
            if (from) {
                console.log('SignIn useEffect navigating to explicit from path:', from);
                navigate(from, { replace: true });
                return;
            }

            // Navigate to highest-priority active module
            const defaultRoute = getDefaultModuleRoute(subscriptions);
            console.log('SignIn useEffect navigating to:', defaultRoute);
            navigate(defaultRoute, { replace: true });
        }
    }, [isAuthenticated, subLoading, subscriptions, navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                await signup(email, password, fullName);
                setSignUpSuccess(true);
            } else {
                await login(email, password);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <img src="/BlackTextLogo.webp" alt="SalesPal" className="h-16 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-400">
                        {isSignUp ? 'Start your free trial' : 'Sign in to access your AI workforce'}
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    {signUpSuccess ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Check your email</h3>
                            <p className="text-gray-400">
                                We've sent a verification link to <span className="text-white font-medium">{email}</span>. 
                                Please click the link to verify your account.
                            </p>
                            <p className="text-sm border border-yellow-500/50 bg-yellow-500/10 text-yellow-200 p-3 rounded-md">
                                <strong>Local Dev Note:</strong> Check the backend console output for the verification link instead of your actual email inbox.
                            </p>
                            <Button
                                onClick={() => {
                                    setSignUpSuccess(false);
                                    setIsSignUp(false);
                                    setPassword('');
                                }}
                                className="w-full justify-center"
                                variant="outline"
                            >
                                Back to Sign In
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3 text-red-200 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {isSignUp && (
                                <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-secondary transition-colors"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-secondary transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-secondary transition-colors"
                                required
                                minLength={6}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full justify-center"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </Button>

                        <div className="relative mt-6 mb-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-900 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex justify-center w-full">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    try {
                                        setError('');
                                        setLoading(true);
                                        await loginWithGoogle(credentialResponse.credential);
                                    } catch (err) {
                                        setError(err.message);
                                        setLoading(false);
                                    }
                                }}
                                onError={() => {
                                    setError('Google Login Failed');
                                }}
                                theme="filled_black"
                                size="large"
                                text={isSignUp ? "signup_with" : "signin_with"}
                                width="300"
                            />
                        </div>
                    </form>
                    )}

                    {!signUpSuccess && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                                className="text-sm text-gray-400 hover:text-secondary transition-colors"
                            >
                                {isSignUp
                                    ? 'Already have an account? Sign In'
                                    : "Don't have an account? Create one"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignIn;

