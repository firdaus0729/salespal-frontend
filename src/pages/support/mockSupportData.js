// TEMPORARY MOCK DATA
// Remove when backend APIs are connected

export const mockTickets = [
    {
        id: "tck_1023",
        ticketNumber: "TCK-1023",
        customer: {
            name: "John Smith",
            email: "john.smith@email.com"
        },
        channel: "WhatsApp",
        category: "Complaints",
        priority: "High",
        status: "Open",
        createdAt: "2026-03-12T12:30:00Z",
        date: "Mar 12, 2026",
        messages: [
            {
                id: "msg1",
                role: "customer",
                senderType: "customer",
                content: "Hello, my order hasn't arrived yet. The tracking number says delivered but I haven't received anything.",
                message: "Hello, my order hasn't arrived yet. The tracking number says delivered but I haven't received anything.",
                time: "12:30 PM",
                createdAt: "2026-03-12T12:30:00Z"
            },
            {
                id: "msg2",
                role: "agent",
                senderType: "agent",
                content: "Hi John, I'm checking with our logistics partner right away. Could you confirm if there is a safe drop location at your property?",
                message: "Hi John, I'm checking with our logistics partner right away. Could you confirm if there is a safe drop location at your property?",
                time: "12:45 PM",
                createdAt: "2026-03-12T12:45:00Z"
            },
            {
                id: "msg3",
                role: "customer",
                senderType: "customer",
                content: "No, there isn't. I live in an apartment complex.",
                message: "No, there isn't. I live in an apartment complex.",
                time: "1:10 PM",
                createdAt: "2026-03-12T13:10:00Z"
            }
        ],
        aiAnalysis: {
            language: "English",
            intent: "Complaint",
            sentiment: "Negative",
            tone: "Frustrated",
            detectedTone: "Frustrated",
            confidence: 92,
            recommendedTone: "Apologetic and helpful"
        }
    },
    {
        id: "tck_1024",
        ticketNumber: "TCK-1024",
        customer: {
            name: "Sarah Williams",
            email: "sarah@email.com"
        },
        channel: "Email",
        category: "Queries",
        priority: "Medium",
        status: "In Progress",
        createdAt: "2026-03-11T09:15:00Z",
        date: "Mar 11, 2026",
        messages: [
            {
                id: "msg1",
                role: "customer",
                senderType: "customer",
                content: "Hi, can you tell me when my subscription renews?",
                message: "Hi, can you tell me when my subscription renews?",
                time: "9:15 AM",
                createdAt: "2026-03-11T09:15:00Z"
            },
            {
                id: "msg2",
                role: "agent",
                senderType: "agent",
                content: "Hi Sarah! Your subscription renews on April 2nd. Let me know if you'd like to change your plan.",
                message: "Hi Sarah! Your subscription renews on April 2nd. Let me know if you'd like to change your plan.",
                time: "9:20 AM",
                createdAt: "2026-03-11T09:20:00Z"
            }
        ],
        aiAnalysis: {
            language: "English",
            intent: "Query",
            sentiment: "Neutral",
            tone: "Curious",
            detectedTone: "Curious",
            confidence: 87,
            recommendedTone: "Helpful and informative"
        }
    }
];
