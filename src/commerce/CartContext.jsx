import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSubscription } from './SubscriptionContext';
import { MODULES } from './commerce.config';
import { usePricing } from '../context/PricingContext';

const CartContext = createContext();

const STORAGE_KEY = 'salespal_cart';

export const CartProvider = ({ children }) => {
    const { isModuleActive } = useSubscription();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
    const { getMonthlyPrice } = usePricing();

    // Initialize from LocalStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCart(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load cart", e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Persist to LocalStorage
    useEffect(() => {
        if (!loading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        }
    }, [cart, loading]);

    const addProductToCart = (product) => {
        if (!product || !product.id) {
            console.error('addProductToCart requires a product with an id');
            return;
        }

        const { id, name, price, type, module: moduleId, creditType, quantity, cartQuantity } = product;

        // Bundle logic: Prevent adding individual sub if bundle is in cart
        const isAddingBundle = type === 'bundle' || moduleId === 'bundle' || id === 'salespal-360';
        const hasBundleInCart = cart.some(item => item.type === 'bundle' || item.moduleId === 'bundle' || item.id === 'salespal-360');

        if (!isAddingBundle && type === 'subscription' && hasBundleInCart) {
            console.warn(`Cannot add ${name} because SalesPal 360 is already in the cart.`);
            return;
        }

        // Prevent adding if already owned for subscription products
        if (type === 'subscription' && moduleId && isModuleActive(moduleId)) {
            console.warn(`User already owns module: ${moduleId}`);
            return;
        }

        // Check for existing item by ID
        const existingItemIndex = cart.findIndex(item => item.id === id);

        if (existingItemIndex > -1) {
            // If credit pack exists, increment quantity (of packs)
            if (type === 'credits') {
                setCart(prev => prev.map((item, idx) =>
                    idx === existingItemIndex
                        ? { ...item, quantity: (item.quantity || 1) + (cartQuantity || 1) }
                        : item
                ));
                return;
            } else {
                console.warn(`Product already in cart: ${id}`);
                return;
            }
        }

        // Correctly mapping incoming product data to cart item structure
        const isCreditPack = type === 'credits';

        // Map product IDs to clean display names
        const displayNames = {
            'marketing': 'Marketing',
            'sales': 'Sales',
            'post-sales': 'Post-Sales',
            'support': 'Support',
            'salespal-360': 'SalesPal 360'
        };

        const newItem = {
            id: id, // Use standardized ID
            productId: id,
            type: type === 'bundle' ? 'bundle' : (isCreditPack ? 'credits' : 'subscription'),
            moduleId: moduleId || null,
            name: displayNames[id] || name, // Use clean display name
            iconKey: moduleId || id, // Store icon key for mapping
            amount: isCreditPack ? quantity : undefined,
            resource: creditType || undefined,
            quantity: cartQuantity || 1,
            ...(isCreditPack && { price }) // Temporarily retain for credit packs avoiding breakage
        };

        if (isAddingBundle) {
            // Remove any individual subscriptions from the cart when adding the bundle
            setCart(prev => {
                const filtered = prev.filter(item => item.type !== 'subscription');
                return [...filtered, newItem];
            });
        } else {
            setCart(prev => [...prev, newItem]);
        }
    };

    const addSubscription = (moduleId) => {
        const moduleConfig = MODULES[moduleId];

        if (!moduleConfig) {
            console.error(`Invalid module ID: ${moduleId}`);
            return;
        }

        const isAddingBundle = moduleId === 'bundle' || moduleId === 'salespal360';
        const hasBundleInCart = cart.some(item => item.type === 'bundle' || item.moduleId === 'bundle' || item.moduleId === 'salespal360');

        if (!isAddingBundle && hasBundleInCart) {
            console.warn(`Cannot add ${moduleConfig.name} because SalesPal 360 is already in the cart.`);
            return;
        }

        // Prevent adding if already owned
        if (isModuleActive(moduleId)) {
            console.warn(`User already owns module: ${moduleId}`);
            return;
        }

        // Prevent duplicates in cart
        if (cart.some(item => (item.type === 'subscription' || item.type === 'bundle') && item.moduleId === moduleId)) {
            console.warn(`Subscription already in cart: ${moduleId}`);
            return;
        }

        // Map module IDs to clean display names
        const displayNames = {
            'marketing': 'Marketing',
            'sales': 'Sales',
            'postSale': 'Post-Sales',
            'support': 'Support',
            'bundle': 'SalesPal 360'
        };

        const newItem = {
            id: `sub_${moduleId}_${Date.now()}`,
            type: isAddingBundle ? 'bundle' : 'subscription',
            moduleId: moduleId,
            name: displayNames[moduleId] || moduleConfig.name,
            iconKey: moduleId, // Store icon key for mapping
            quantity: 1
        };

        if (isAddingBundle) {
            setCart(prev => {
                const filtered = prev.filter(item => item.type !== 'subscription');
                return [...filtered, newItem];
            });
        } else {
            setCart(prev => [...prev, newItem]);
        }
    };

    const addCreditPack = (moduleId, resource, amount, price) => {
        // Find if identical pack exists
        const existingItemIndex = cart.findIndex(
            item => item.type === 'credit' &&
                item.moduleId === moduleId &&
                item.resource === resource &&
                item.amount === amount
        );

        if (existingItemIndex > -1) {
            // Increase quantity
            setCart(prev => prev.map((item, idx) =>
                idx === existingItemIndex
                    ? { ...item, quantity: (item.quantity || 1) + 1 }
                    : item
            ));
        } else {
            // Add new item
            const newItem = {
                id: `cred_${moduleId}_${resource}_${Date.now()}`,
                type: 'credit',
                moduleId: moduleId,
                resource: resource,
                amount: amount,
                name: `${amount} ${resource} Credits`,
                price: price,
                quantity: 1
            };
            setCart(prev => [...prev, newItem]);
        }
    };

    const removeItem = (itemId) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            if (item.type === 'credits' || item.type === 'credit') {
                return total + ((item.price || 0) * (item.quantity || 1));
            }
            
            let productKey = item.moduleId || item.id;
            if (productKey === 'bundle' || productKey === 'salespal-360' || productKey === 'salespal360') productKey = 'salespal-360';
            if (productKey === 'postSale') productKey = 'post-sales';
            
            const dynamicPrice = getMonthlyPrice(productKey) || 0;
            return total + (dynamicPrice * (item.quantity || 1));
        }, 0);
    };

    const openMiniCart = () => setIsMiniCartOpen(true);
    const closeMiniCart = () => setIsMiniCartOpen(false);
    const toggleMiniCart = () => setIsMiniCartOpen(prev => !prev);

    return (
        <CartContext.Provider value={useMemo(() => ({
            cart,
            loading,
            isMiniCartOpen,
            addProductToCart,
            addSubscription,
            addCreditPack,
            removeItem,
            clearCart,
            getCartTotal,
            openMiniCart,
            closeMiniCart,
            toggleMiniCart,
        }), [cart, loading, isMiniCartOpen])}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
