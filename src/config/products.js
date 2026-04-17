// Get prices from localStorage or use defaults
const getPrice = (id, defaultPrice) => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`price_${id}`);
        return stored ? parseInt(stored) : defaultPrice;
    }
    return defaultPrice;
};

export const PRODUCTS = {
    marketing: {
        id: "marketing",
        name: "Marketing",
        subtitle: "AI-Powered Ad Campaigns",
        type: "subscription",
        price: 5999,
        module: "marketing",
        get displayPrice() {
            return getPrice('marketing', 5999);
        }
    },
    sales: {
        id: "sales",
        name: "Sales",
        subtitle: "Human-like Conversations",
        type: "subscription",
        price: 9999,
        module: "sales",
        get displayPrice() {
            return getPrice('sales', 9999);
        }
    },
    postSales: {
        id: "post-sales",
        name: "Post-Sales",
        subtitle: "Automated Customer Success",
        type: "subscription",
        price: 9999,
        module: "postSale",
        get displayPrice() {
            return getPrice('post-sales', 9999);
        }
    },
    support: {
        id: "support",
        name: "Support",
        subtitle: "24/7 AI Support",
        type: "subscription",
        price: 9999,
        module: "support",
        get displayPrice() {
            return getPrice('support', 9999);
        }
    },
    salesPal360: {
        id: "salespal-360",
        name: "SalesPal 360",
        subtitle: "Complete AI Revenue Operating System",
        type: "bundle",
        price: 29999,
        module: "bundle",
        get displayPrice() {
            return getPrice('salespal-360', 29999);
        }
    }
};

// Helper function to update prices
export const updateProductPrice = (productId, newPrice) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(`price_${productId}`, newPrice.toString());
    }
};


