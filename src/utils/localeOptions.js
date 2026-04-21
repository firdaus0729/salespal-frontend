/**
 * Timezone list: IANA zones from the runtime when available (typically 400+).
 * Language list: ISO 639-1 codes with English labels via Intl.DisplayNames, plus Hinglish as default option.
 */

const ISO_639_1_CODES =
    'aa ab ae af ak am an ar as av ay az ba be bg bh bi bm bn bo br bs ca ce ch co cr cs cu cv cy da de dv dz ee el en eo es et eu fa ff fi fj fo fr fy ga gd gl gn gu gv ha he hi ho hr ht hu hy hz ia id ie ig ii ik io is it iu ja jv ka kg ki kj kk kl km kn ko kr ks ku kv kw ky la lb lg li ln lo lt lu lv mg mh mi mk ml mn mr ms mt my na nb nd ne ng nl nn no nr nv ny oc oj om or os pa pi pl ps pt qu rm rn ro ru rw sa sc sd se sg si sk sl sm sn so sq sr ss st su sv sw ta te tg th ti tk tl tn to tr ts tt tw ty ug uk ur uz ve vi vo wa wo xh yi yo za zh zu'.split(
        /\s+/
    );

/** Default language for new leads (code stored in metadata.preferredLocale). */
export const DEFAULT_PREFERRED_LOCALE = 'hing';

export function getDefaultTimeZone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'Asia/Kolkata';
    }
}

export function getAllTimeZones() {
    try {
        if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
            return Intl.supportedValuesOf('timeZone').sort((a, b) => a.localeCompare(b));
        }
    } catch {
        /* fall through */
    }
    return ['UTC', 'Asia/Kolkata', 'Asia/Dubai', 'America/New_York', 'Europe/London'];
}

/** Ensure select value exists in IANA list (handles Asia/Calcutta vs Kolkata, etc.). */
export function resolveTimeZoneOption(preferred, list) {
    const p = String(preferred || '').trim();
    if (!list?.length) return p || 'UTC';
    if (list.includes(p)) return p;
    if (p === 'Asia/Calcutta' && list.includes('Asia/Kolkata')) return 'Asia/Kolkata';
    const kolkata = list.find((z) => z.includes('Kolkata') || z.includes('Calcutta'));
    if (kolkata) return kolkata;
    return list.includes('UTC') ? 'UTC' : list[0];
}

let cachedLanguageOptions = null;

/**
 * Select options: Hinglish first, then all ISO 639-1 languages sorted by English name.
 */
export function getLanguageSelectOptions() {
    if (cachedLanguageOptions) return cachedLanguageOptions;
    const rest = [];
    let dn;
    try {
        dn = new Intl.DisplayNames(['en'], { type: 'language' });
    } catch {
        cachedLanguageOptions = [{ value: 'hing', label: 'Hinglish' }, { value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }];
        return cachedLanguageOptions;
    }
    for (const code of ISO_639_1_CODES) {
        try {
            const name = dn.of(code);
            if (name) rest.push({ value: code, label: `${name} (${code})` });
        } catch {
            /* skip */
        }
    }
    rest.sort((a, b) => a.label.localeCompare(b.label));
    cachedLanguageOptions = [{ value: 'hing', label: 'Hinglish' }, ...rest];
    return cachedLanguageOptions;
}

/**
 * BCP-47 tag for Web Speech API `recognition.lang` from lead preferred locale (ISO 639-1 or `hing`).
 * Improves transcription when the lead’s language is not English. Browser support varies by language.
 */
export function speechRecognitionLangForLocale(preferredLocale) {
    const raw = String(preferredLocale || 'en').trim().toLowerCase();
    const base = raw.split(/[-_]/)[0];
    const map = {
        hing: 'hi-IN',
        hi: 'hi-IN',
        en: 'en-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        pa: 'pa-IN',
        bn: 'bn-IN',
        ar: 'ar-SA',
        ur: 'ur-PK',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        it: 'it-IT',
        pt: 'pt-BR',
        ru: 'ru-RU',
        ja: 'ja-JP',
        ko: 'ko-KR',
        zh: 'zh-CN',
        tr: 'tr-TR',
        vi: 'vi-VN',
        th: 'th-TH',
        id: 'id-ID',
        ms: 'ms-MY',
        pl: 'pl-PL',
        uk: 'uk-UA',
        nl: 'nl-NL',
        sv: 'sv-SE',
        da: 'da-DK',
        fi: 'fi-FI',
        no: 'nb-NO',
        el: 'el-GR',
        he: 'he-IL',
        fa: 'fa-IR',
    };
    if (map[base]) return map[base];
    if (/^[a-z]{2}$/.test(base)) return `${base}-${base.toUpperCase()}`;
    return 'en-IN';
}
