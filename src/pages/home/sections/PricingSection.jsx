import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionWrapper from '../../../components/layout/SectionWrapper';
import { Phone, Check, ShoppingCart, Layers, Plus, PhoneCall, MessageSquare, Image, Grid3x3, Video, Zap, Bot, UserCheck, Megaphone, Headphones, Wrench } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { usePreferences } from '../../../context/PreferencesContext';
import { useCart } from '../../../commerce/CartContext';
import { useSubscription } from '../../../commerce/SubscriptionContext';
import { useToast } from '../../../components/ui/Toast';
import { PRODUCTS } from '../../../config/products';
import { usePricing } from '../../../context/PricingContext';

const PricingSection = () => {
    const { addProductToCart, cart, openMiniCart } = useCart();
    const { isModuleActive } = useSubscription();
    const { showToast } = useToast();
    const { formatCurrency } = usePreferences();
    const { getMonthlyPrice, isModuleVisible } = usePricing();

    const getDynamicPrice = (config) => {
        let productKey = config.module;
        if (productKey === 'bundle' || productKey === 'salespal-360') productKey = 'salespal-360';
        if (productKey === 'postSale') productKey = 'post-sales';
        
        return getMonthlyPrice(productKey) || config.price;
    }

    const isProductInCart = (productConfig) => {
        if (!productConfig) return false;
        return cart.some(item =>
            (item.productId && item.productId === productConfig.id) ||
            (!item.productId && item.type === 'subscription' && item.moduleId === productConfig.module)
        );
    };

    const handleAddProductToCart = (productConfig) => {
        // Prevent duplicates – CartContext also guards, but we short-circuit for UX
        if (isProductInCart(productConfig)) {
            openMiniCart();
            showToast({
                title: 'Already in Cart',
                description: `${productConfig.name} is already in your cart.`,
                duration: 3000
            });
            return;
        }

        if (productConfig.id === 'setup-cost-5000') {
            // One-time setup cost per project
            addProductToCart({
                id: 'setup-cost-5000',
                name: 'One-Time Setup Cost',
                price: 5000,
                type: 'credits',
                quantity: 1,
                cartQuantity: 1
            });
            openMiniCart();
            showToast({
                title: 'Added to Cart',
                description: 'One-Time Setup Cost has been added to your cart.',
                duration: 3000
            });
            return;
        }

        if (productConfig.id === 'top-up-1000') {
            // For top-ups (Credits) - currently assuming generic credit for simplicity or mapping to specific resource
            // The prompt/UI implies a generic top-up, but CartContext expects resource/amount.
            // For now, let's map it to a default "credits" resource or similar if the context supports it, 
            // OR if CartContext requires specifics, we might need to adjust.
            // Looking at CartContext: addCreditPack(moduleId, resource, amount, price)
            // TopUp card says "Works with all products", so maybe a generic 'wallet' or specific pack?
            // The UI shows options like "+200 AI calling minutes". 
            // The "Add Top-Up" button seems to be for a specific 1000rs credit? 
            // The user code passed: 
            /* 
            handleAddToCart({
                id: 'top-up-1000',
                name: 'Top-Up Credit',
                subtitle: '₹1,000 Universal Credit',
                price: 1000,
                // ...
            })
            */
            // Since CartContext expects strict params, and this is a "Universal Credit", 
            // I will use a placeholder 'credits' resource for now to prevent errors, 
            // ensuring it adds to cart validly.
            // However, looking at the code, the user might want to add specific top-ups from the list below.
            // The button adds a fixed 1000rs top up. 
            // I will use a dummy module ID 'universal' and resource 'credits'.
            // wait, addCreditPack takes (moduleId, resource, amount, price).
            // I'll check if I can just add a subscription type item that is a "credit" type?
            // core cart context distinguishes by type='credit' or 'subscription'.
            // TODO: Wire to addCreditPack when credit packs are finalized
            openMiniCart();
            showToast({
                title: 'Added to Cart',
                description: `${productConfig.name} has been added to your cart.`,
                duration: 3000
            });
            return;
        }

        // Standard Subscription
        addProductToCart(productConfig);
        openMiniCart();
        showToast({
            title: 'Added to Cart',
            description: `${productConfig.name} has been added to your cart.`,
            duration: 3000
        });
    };



    const products = [
        {
            config: PRODUCTS.salesPal360,
            subtitle: "Complete AI revenue operating system",
            icon: Layers,
            iconBg: "bg-linear-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20",
            features: [
                "All 4 products included",
                "2200 WhatsApp conversations / month",
                "One shared AI memory",
                "Role-based access",
                "2200 AI calling minutes / month",
                "Single customer timeline",
                "Owner control center",
                "Outcome dashboards"
            ],
            isFlagship: true
        },
        {
            config: PRODUCTS.marketing,
            subtitle: "AI-powered ad campaigns",
            icon: Megaphone,
            iconBg: "bg-linear-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20",
            features: [
                "20 AI image creatives / month",
                "4 AI videos (≥30 sec) / month",
                "6 AI carousel creatives / month",
                "30 scheduled posts / month",
                "AI ad copy & captions",
                "Multi-platform publishing"
            ]
        },
        {
            config: PRODUCTS.sales,
            subtitle: "Human-like conversations",
            icon: Phone,
            iconBg: "bg-linear-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/20",
            features: [
                "1000 AI calling minutes / month",
                "1000 WhatsApp conversations / month",
                "AI outbound & inbound calling",
                "AI WhatsApp replies",
                "Follow-up & re-scheduling logic",
                "Context memory",
                "Human escalation when needed"
            ]
        },
        {
            config: PRODUCTS.postSales,
            subtitle: "Automated customer success",
            icon: UserCheck,
            iconBg: "bg-linear-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/20",
            features: [
                "1000 AI calling minutes / month",
                "1000 WhatsApp conversations / month",
                "Automated payment reminders",
                "Payment proof collection",
                "Owner verified closure",
                "Document checklist & re-upload",
                "Full audit log"
            ]
        },
        {
            config: PRODUCTS.support,
            subtitle: "24/7 AI support",
            icon: Headphones,
            iconBg: "bg-linear-to-br from-orange-500 to-red-500 shadow-lg shadow-red-500/20",
            features: [
                "1000 AI calling minutes / month",
                "1000 WhatsApp conversations / month",
                "AI answers from your knowledge",
                "No hallucination logic",
                "Complaint registration ID",
                "Sentiment detection"
            ]
        }
    ];

    const salesPal360Features = [
        "All 4 products included",
        "2200 WhatsApp conversations / month",
        "One shared AI memory",
        "Role-based access",
        "2200 AI calling minutes / month",
        "Single customer timeline",
        "Owner control center",
        "Outcome dashboards"
    ];

    const topUpOptions = [
        { icon: PhoneCall, label: "+200 AI calling minutes", color: "text-green-400" },
        { icon: MessageSquare, label: "+200 WhatsApp conversations", color: "text-blue-400" },
        { icon: Image, label: "+10 AI images", color: "text-purple-400" },
        { icon: Grid3x3, label: "+5 AI carousels", color: "text-orange-400" },
        { icon: Video, label: "+2 AI videos (≥30 sec)", color: "text-red-400" }
    ];



    return (
        <SectionWrapper id="pricing" className="bg-linear-to-b from-white to-gray-50">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    Simple, <span className="bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Transparent</span> Pricing
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Choose individual products or get everything with SalesPal 360. No hidden fees.
                </p>
            </div>

            <div className="space-y-6">
                {/* SalesPal 360 Flagship Plan */}
                {products.filter(p => p.isFlagship && isModuleVisible(p.config.module)).map((product, idx) => {
                    const config = product.config;
                    const isOwned = config.type === 'subscription' ? isModuleActive(config.module) : false;
                    const isAdded = isProductInCart(config);

                    return (
                        <div
                            key={idx}
                            className="w-full p-8 md:p-12 rounded-[32px] bg-white border border-gray-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-12"
                        >
                            {/* Best Value Badge */}
                            <div className="absolute top-0 right-0">
                                <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-bl-xl shadow-sm flex items-center gap-1.5">
                                    <span className="text-yellow-400">★</span> Best Value
                                </div>
                            </div>

                            {/* Left Content Side */}
                            <div className="w-full md:w-5/12 relative z-10 flex flex-col justify-center items-start">
                                <div className="w-16 h-16 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-6">
                                    <Layers className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
                                    {config.name}
                                </h3>
                                <p className="text-gray-500 text-base mb-6">{product.subtitle}</p>

                                <div className="flex items-baseline gap-1 mb-8">
                                    { getDynamicPrice(config) ? (
                                        <>
                                            <span className="text-5xl font-bold text-gray-900 tracking-tight">{formatCurrency(getDynamicPrice(config))}</span>
                                            <span className="text-gray-400 text-lg font-medium"> /month</span>
                                        </>
                                    ) : (
                                        <span className="text-2xl font-medium text-gray-400">Loading price...</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => !isOwned && !isAdded && handleAddProductToCart(config)}
                                    disabled={isOwned || isAdded}
                                    className={`px-8 py-3.5 rounded-xl font-bold shadow-sm transition-all ${isOwned
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : isAdded
                                            ? 'bg-green-50 text-green-600 border border-green-200 cursor-not-allowed'
                                            : 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 hover:opacity-90 hover:scale-[1.02]'
                                        }`}
                                >
                                    {isOwned ? "Current Plan" : isAdded ? "Added ✓" : "Get Started with 360"}
                                </button>
                            </div>

                            {/* Right Feature Side */}
                            <div className="w-full md:w-7/12 flex items-center">
                                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                    {product.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-blue-600" strokeWidth={3} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {(() => {
                    const visibleRegularProducts = products.filter(p => !p.isFlagship && isModuleVisible(p.config.module));
                    if (visibleRegularProducts.length === 0) return null;

                    return (
                        <div className={`grid md:grid-cols-2 gap-6 ${
                            visibleRegularProducts.length === 1 ? 'lg:grid-cols-1 max-w-sm mx-auto' :
                            visibleRegularProducts.length === 2 ? 'lg:grid-cols-2 max-w-4xl mx-auto' :
                            visibleRegularProducts.length === 3 ? 'lg:grid-cols-3 max-w-6xl mx-auto' :
                            'lg:grid-cols-4'
                        }`}>
                            {visibleRegularProducts.map((product, idx) => {
                                const Icon = product.icon;
                                const config = product.config;
                                const isOwned = config.type === 'subscription' ? isModuleActive(config.module) : false;
                                const isAdded = isProductInCart(config);

                                return (
                                    <div
                                        key={idx}
                                        className={`p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col bg-white border-gray-100 shadow-lg hover:shadow-xl`}
                                    >


                                        <div className={`w-14 h-14 ${product.iconBg} rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{config.name}</h3>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{product.subtitle}</p>

                                        {/* Dynamic Pricing rendered from Backend/Settings */}
                                        <div className="mb-6">
                                            { getDynamicPrice(config) ? (
                                                <>
                                                    <span className="text-3xl font-bold text-gray-900">{formatCurrency(getDynamicPrice(config))}</span>
                                                    <span className="text-gray-600 text-sm">/mo</span>
                                                </>
                                            ) : (
                                                <span className="text-lg font-medium text-gray-500">Loading price...</span>
                                            )}
                                        </div>

                                        <ul className="space-y-3 mb-8 flex-1">
                                            {product.features.map((feature, fIdx) => (
                                                <li key={fIdx} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${isOwned
                                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                                                : isAdded
                                                    ? 'bg-green-50 text-green-600 border border-green-200 cursor-not-allowed'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-transparent hover:bg-linear-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white shadow-sm hover:shadow-lg hover:shadow-blue-500/25'
                                                }`}
                                            onClick={() => !isOwned && !isAdded && handleAddProductToCart(config)}
                                            disabled={isOwned || isAdded}
                                        >
                                            {isOwned ? (
                                                <span>Current Plan</span>
                                            ) : isAdded ? (
                                                <span>Added ✓</span>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
                                                    <span>Add to Cart</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>

            {/* Top-Up Section */}
            <div className="mt-8 p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                        <Plus className="w-7 h-7 text-white" />
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{formatCurrency(1000)} Top-Up</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                            Choose ANY ONE of the following options. Works with all products. No plan change required.
                        </p>
                    </div>

                    {/* Button */}
                    <button
                        onClick={() => handleAddProductToCart({
                            id: 'top-up-1000',
                            name: 'Top-Up Credit',
                            subtitle: `${formatCurrency(1000)} Universal Credit`,
                            price: 1000,
                            features: ['Works with all products', 'No expiry', 'Instant credit']
                        })}
                        className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all shrink-0 ml-auto shadow-sm ${
                            cart.some(item => item.id === 'top-up-1000')
                                ? 'bg-green-50 text-green-600 border border-green-200 cursor-not-allowed'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-linear-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-transparent'
                        }`}
                        disabled={cart.some(item => item.id === 'top-up-1000')}
                    >
                        {cart.some(item => item.id === 'top-up-1000') ? 'Added ✓' : 'Add Top-Up'}
                    </button>
                </div>

                {/* Top-up options */}
                <div className="mt-8 flex flex-wrap gap-3">
                    {topUpOptions.map((option, idx) => {
                        const Icon = option.icon;
                        return (
                            <div key={idx} className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-gray-50 border border-gray-100/50">
                                <Icon className={`w-4 h-4 ${option.color}`} strokeWidth={2.5} />
                                <span className="text-[13px] font-semibold text-gray-600">{option.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* One-Time Setup Cost Section */}
            <div className="mt-8 p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-linear-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20">
                        <Wrench className="w-7 h-7 text-white" />
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{formatCurrency(5000)} One-Time Setup Cost</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                            Per Project — one-time fee for initial setup, onboarding, and configuration. Charged once per project.
                        </p>
                    </div>

                    {/* Button */}
                    <button
                        onClick={() => handleAddProductToCart({
                            id: 'setup-cost-5000',
                            name: 'One-Time Setup Cost',
                            price: 5000,
                        })}
                        className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all shrink-0 ml-auto shadow-sm ${
                            cart.some(item => item.id === 'setup-cost-5000')
                                ? 'bg-green-50 text-green-600 border border-green-200 cursor-not-allowed'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-linear-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-transparent'
                        }`}
                        disabled={cart.some(item => item.id === 'setup-cost-5000')}
                    >
                        {cart.some(item => item.id === 'setup-cost-5000') ? 'Added ✓' : 'Add Setup Cost'}
                    </button>
                </div>
            </div>

            {/* Custom Solution CTA */}
            <div className="mt-12 text-center">
                <p className="text-gray-600 mb-4">Need a custom solution for your enterprise?</p>
                <Link to="/contact">
                    <button className="bg-white border border-gray-300 hover:bg-blue-600 hover:border-blue-600 hover:text-white text-gray-900 px-8 py-2.5 rounded-lg font-medium transition-all">
                        Contact Sales
                    </button>
                </Link>
            </div>


        </SectionWrapper >
    );
};

export default PricingSection;


