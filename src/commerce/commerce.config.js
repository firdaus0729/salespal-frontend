export const MODULES = {
    marketing: {
        id: "marketing",
        name: "Marketing",
        price: 5999,
        limits: {
            images: 20,
            videos: 4,
            posts: 30,
            calls: 500,
            whatsapp: 300
        },
        creditPacks: {
            images: [
                { amount: 10, price: 499 },
                { amount: 25, price: 999 }
            ]
        }
    },
    sales: {
        id: "sales",
        name: "Sales",
        price: 9999
    },
    postSale: {
        id: "postSale",
        name: "Post-Sales",
        price: 9999
    },
    support: {
        id: "support",
        name: "Support",
        price: 9999
    },
    salespal360: {
        id: "salespal360",
        name: "SalesPal 360",
        price: 29999,
        limits: {
            images: 100,
            videos: 20,
            posts: 150,
            calls: 1000,
            whatsapp: 500
        }
    }
};
