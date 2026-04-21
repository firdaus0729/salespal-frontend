/** UUID v4 — only these leads sync to the API. */
export function isPersistableLeadId(id) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || ''));
}

export function parseDurationSecondsFromLabel(label) {
    if (label == null) return null;
    const s = String(label);
    const m = s.match(/(\d+)\s*m\s*(\d+)/i);
    if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    const sec = s.match(/(\d+)\s*s/i);
    if (sec) return parseInt(sec[1], 10);
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : null;
}

function formatActionTime(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDurationFromSeconds(sec) {
    if (sec == null || !Number.isFinite(Number(sec))) return '0m 0s';
    const n = Math.max(0, Math.floor(Number(sec)));
    const mm = Math.floor(n / 60);
    const ss = n % 60;
    return `${mm}m ${String(ss).padStart(2, '0')}s`;
}

/**
 * Build POST /sales/:id/actions body from the same args as addActionToLead.
 */
export function buildLeadActionPayload(type, action, detail, additionalData = {}) {
    let durationSeconds = null;
    if (additionalData.durationSeconds != null && Number.isFinite(Number(additionalData.durationSeconds))) {
        durationSeconds = Math.floor(Number(additionalData.durationSeconds));
    } else {
        durationSeconds = parseDurationSecondsFromLabel(additionalData.duration);
    }
    return {
        type,
        content: detail != null ? String(detail) : '',
        outcome: additionalData.outcome != null ? String(additionalData.outcome) : null,
        durationSeconds: durationSeconds != null && Number.isFinite(durationSeconds) ? durationSeconds : null,
        metadata: { ...additionalData, title: action },
    };
}

/**
 * Map GET /sales/:id/actions rows into timeline + communications + followups for the workspace.
 */
export function hydrateLeadStateFromActions(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
        return { timeline: [], communications: [], followups: [], lastInteraction: null };
    }

    const sorted = [...rows].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const timeline = [];
    const callComms = [];
    const waMsgs = [];
    const followups = [];
    let lastInteraction = null;

    for (const row of sorted) {
        const md = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata : {};
        const timeStr = formatActionTime(row.created_at);
        const ev = {
            id: row.id,
            type: row.type === 'ai_action' ? 'ai_action' : row.type,
            action: md.title || row.outcome || row.type,
            time: timeStr,
            detail: row.content || '',
        };
        timeline.push(ev);
        lastInteraction = md.title || row.content || lastInteraction;

        if (row.type === 'call') {
            callComms.push({
                id: row.id,
                type: 'call',
                time: timeStr,
                duration: md.duration || formatDurationFromSeconds(row.duration_seconds),
                outcome: row.outcome || md.outcome || 'Logged',
                recording: md.recording || null,
                recordingUrl: md.recordingUrl || null,
                transcript: md.transcript || [],
            });
        }

        if (row.type === 'whatsapp') {
            waMsgs.push({
                id: row.id,
                sender: md.sender || 'SalesRep',
                text: row.content || '',
                time: timeStr,
                attachment: md.attachment || undefined,
            });
        }

        if (row.type === 'meeting') {
            followups.push({
                id: row.id,
                task: md.title || `Meeting: ${row.content || ''}`,
                status: 'Pending',
                time: md.date ? `${md.date}${md.time ? ` ${md.time}` : ''}` : timeStr,
            });
        }
    }

    timeline.reverse();

    const communications = [];
    if (callComms.length) {
        communications.push(...callComms.slice().reverse());
    }
    if (waMsgs.length) {
        communications.push({
            id: `whatsapp-${sorted[0]?.lead_id || 'thread'}`,
            type: 'whatsapp',
            history: waMsgs,
        });
    }

    return { timeline, communications, followups, lastInteraction };
}
