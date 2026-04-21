/**
 * Sales bot routing rules (voice + WhatsApp) aligned with product flowcharts.
 * Call window and result strings are centralized here.
 */

export const CALL_RESULT = {
    NO_ANSWER: 'No Answer',
    BUSY: 'Busy',
    WRONG_NUMBER: 'Wrong Number',
    CONNECTED: 'Connected',
};

/** Shown on timeline / comms when the call ends with this result */
export const CALL_RESULT_DETAIL = {
    [CALL_RESULT.NO_ANSWER]: 'Retry 2hr then 6:30 PM then next day',
    [CALL_RESULT.BUSY]: 'Retry next slot',
    [CALL_RESULT.WRONG_NUMBER]: 'Stop — invalid number / call stopped immediately',
    [CALL_RESULT.CONNECTED]: 'Conversation — continuing',
};

export const WHATSAPP_REPLY_STATE = {
    NO: 'No',
    YES: 'Yes',
};

export const WHATSAPP_NO_REPLY_DETAIL = 'Follow-up Day0 Day1 Day3 Day5 Day7';

/** Seconds to wait for lead speech after AI finishes (voice). */
export const VOICE_SILENCE_MS = 30_000;

/** Seconds to wait for user message after AI sends (WhatsApp). */
export const WHATSAPP_SILENCE_MS = 30_000;

/**
 * Call is active 9:00–21:59 in the lead’s IANA timezone (9 AM–9 PM local).
 */
export function isWithinCallActiveWindow(ianaTimeZone) {
    const tz = ianaTimeZone || 'Asia/Kolkata';
    try {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: tz,
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
        }).formatToParts(new Date());
        const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '12', 10);
        return hour >= 9 && hour <= 21;
    } catch {
        const h = new Date().getHours();
        return h >= 9 && h <= 21;
    }
}

export function callWindowLabel(ianaTimeZone) {
    const tz = ianaTimeZone || 'Asia/Kolkata';
    return `Calls 9:00 AM – 9:00 PM (${tz}). WhatsApp 24/7.`;
}
