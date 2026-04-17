import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import useReducedMotion from '../../hooks/useReducedMotion';
import AuthModal from '../auth/AuthModal';
import { useCart } from '../../commerce/CartContext';
import { useSubscription } from '../../commerce/SubscriptionContext';
import { ShoppingCart } from 'lucide-react';
import NavbarUserMenu from './NavbarUserMenu';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();

    const [activeSection, setActiveSection] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(false);
    const { cart, openMiniCart } = useCart();
    const { subscriptions, loading: subLoading } = useSubscription();

    const getDashboardRoute = () => {
        if (!subscriptions) return '/marketing';
        const activeModules = Object.keys(subscriptions).filter(key => subscriptions[key]?.active);
        
        let route = '/marketing';
        if (activeModules.includes('salespal-360')) route = '/marketing';
        else if (activeModules.includes('marketing')) route = '/marketing';
        else if (activeModules.includes('sales')) route = '/sales';
        else if (activeModules.includes('postSale')) route = '/post-sales';
        else if (activeModules.includes('support')) route = '/support';
        
        console.log('Navbar computed dashboard route:', route, 'Active modules:', activeModules);
        return route;
    };

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['about', 'modules', 'how-it-works', 'pricing', 'contact'];
            const scrollPosition = window.scrollY + 150;

            // Update navbar style based on scroll
            setIsScrolled(window.scrollY > 20);

            // Specific check for bottom of page to prioritize Contact section
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
                setActiveSection('contact');
                return;
            }

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const offsetTop = element.offsetTop;
                    const offsetHeight = element.offsetHeight;

                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section);
                        return;
                    }
                }
            }

            if (window.scrollY < 50) {
                setActiveSection('');
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check on mount
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (location.state?.openAuth && !isAuthenticated) {
            setShowAuthModal(true);
            // innovative clean up of history state without reload
            window.history.replaceState({}, document.title);
        }
    }, [location, isAuthenticated]);

    useEffect(() => {
        if (pendingNavigation && isAuthenticated && !subLoading) {
            const route = getDashboardRoute();
            console.log('Navbar pendingNavigation navigating to:', route);
            navigate(route);
            setPendingNavigation(false);
        }
    }, [pendingNavigation, isAuthenticated, subLoading, subscriptions, navigate]);

    const scrollToSection = (id) => {
        if (location.pathname !== '/') {
            window.location.href = `/#${id}`;
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });

                // Brief highlight effect on section title
                const sectionTitle = element.querySelector('h2, h1');
                if (sectionTitle && !prefersReducedMotion) {
                    sectionTitle.style.transition = 'text-shadow 0.4s ease-out';
                    sectionTitle.style.textShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
                    setTimeout(() => {
                        sectionTitle.style.textShadow = 'none';
                    }, 400);
                }
            }
        }
    };

    return (
        <motion.nav
            className={`fixed top-0 w-full z-50 ${isScrolled ? 'border-b border-gray-200' : ''}`}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -10, filter: 'blur(8px)' }}
            animate={prefersReducedMotion ? {} : {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                height: isScrolled ? '72px' : '88px',
                backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(249, 250, 251, 0.95)',
                backdropFilter: isScrolled ? 'blur(16px)' : 'blur(12px)',
                boxShadow: isScrolled ? '0 4px 12px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.06)'
            }}
            transition={{
                opacity: { duration: 0.5 },
                y: { duration: 0.5 },
                filter: { duration: 0.5 },
                height: { duration: 0.25, ease: 'easeOut' },
                backgroundColor: { duration: 0.25 },
                backdropFilter: { duration: 0.25 },
                boxShadow: { duration: 0.25 }
            }}
            style={{
                backgroundColor: 'rgba(249, 250, 251, 0.95)',
                backdropFilter: 'blur(12px)'
            }}
        >
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                <Link to="/" className="flex items-center -ml-12">
                    <img
                        src="/BlackTextLogo.webp"
                        alt="SalesPal Logo"
                        className="h-16 object-contain"
                    />
                </Link>

                <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
                    {[
                        { id: 'about', label: 'About' },
                        { id: 'modules', label: 'Products' },
                        { id: 'how-it-works', label: 'How It Works' },
                        { id: 'pricing', label: 'Pricing' }
                    ].map((link) => (
                        <motion.button
                            key={link.id}
                            onClick={() => scrollToSection(link.id)}
                            className="relative py-1 text-gray-600 transition-colors hover:text-blue-600"
                            whileHover="hover"
                            initial="rest"
                        >
                            {link.label}
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                variants={{
                                    rest: { scaleX: activeSection === link.id ? 1 : 0, opacity: activeSection === link.id ? 1 : 0 },
                                    hover: { scaleX: 1, opacity: 1 }
                                }}
                                initial="rest"
                                animate={activeSection === link.id ? "hover" : "rest"}
                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                style={{ transformOrigin: 'left' }}
                            />
                        </motion.button>
                    ))}
                    <Link to="/contact" className="relative py-1 text-gray-600 transition-colors hover:text-blue-600">
                        Contact
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        type="button"
                        onClick={openMiniCart}
                        className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-colors"
                        aria-label="Open mini cart"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {cart.length > 0 && (
                            <span className="absolute top-1 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                                {cart.length}
                            </span>
                        )}
                    </button>

                    {isAuthenticated ? (
                        <>
                            <Link
                                to={getDashboardRoute()}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                My Workspace
                            </Link>
                            <NavbarUserMenu />
                        </>
                    ) : (

                        <button
                            onClick={() => setShowAuthModal(true)}
                            className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:-translate-y-0.5"
                            style={{
                                background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                boxShadow: '0px 4px 12px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={() => {
                    setPendingNavigation(true);
                    setShowAuthModal(false);
                }}
            />
        </motion.nav >
    );
};

export default Navbar;
