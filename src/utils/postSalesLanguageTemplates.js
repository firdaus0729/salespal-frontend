const COPY = {
    en: {
        pending_payment: 'Hi {{name}}, this is a gentle reminder for your pending payment of {{amount}}. Please share an update when done.',
        partial_payment: 'Hi {{name}}, we received your partial payment. Please share payment proof so we can verify with the owner.',
        pending_document: 'Hi {{name}}, please share the pending documents. We are following up on Day 0, Day 2, and Day 4.',
        ask_rating: 'Hi {{name}}, thank you. Could you rate your post-sales experience from 1 to 10?',
    },
    hi: {
        pending_payment: 'Namaste {{name}}, aapki {{amount}} payment pending hai. Kripya payment update share karein.',
        partial_payment: 'Namaste {{name}}, partial payment receive hua hai. Verification ke liye payment proof share karein.',
        pending_document: 'Namaste {{name}}, kripya pending documents share karein. Hum Day 0, Day 2 aur Day 4 follow-up karenge.',
        ask_rating: 'Namaste {{name}}, dhanyavaad. Kripya apna post-sales experience 1 se 10 tak rate karein.',
    },
    hing: {
        pending_payment: 'Hi {{name}}, aapka {{amount}} payment pending hai. Ho sake to update bhej do.',
        partial_payment: 'Hi {{name}}, partial payment mil gaya. Owner verify ke liye payment proof share kar do.',
        pending_document: 'Hi {{name}}, pending documents share kar do please. Day 0, Day 2, Day 4 follow-up rahega.',
        ask_rating: 'Hi {{name}}, thanks! Post-sales experience ko 1 to 10 rate karoge?',
    },
};

function fill(template, vars) {
    return String(template || '').replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));
}

export function resolvePostSalesLocale(preferredLocale, autoLanguageSwitch) {
    const base = String(preferredLocale || 'hing').toLowerCase().split(/[-_]/)[0];
    if (!autoLanguageSwitch) return base in COPY ? base : 'en';
    if (base in COPY) return base;
    return 'hing';
}

export function getPostSalesTemplate(kind, { name, amount, preferredLocale, autoLanguageSwitch }) {
    const locale = resolvePostSalesLocale(preferredLocale, autoLanguageSwitch);
    const bucket = COPY[locale] || COPY.en;
    const fallback = COPY.en[kind] || '';
    return fill(bucket[kind] || fallback, { name: name || 'Customer', amount: amount || 'payment' });
}
