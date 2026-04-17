export const theme = {
    colors: {
        primary: "#0D1F2D",
        secondary: "#76F7C5", // Legacy - kept for backward compatibility
        accent: "#1D7CFF", // New primary accent
        accentHover: "#0B5DDA",
        accentDeep: "#073B8F",
        accentSoft: "rgba(29, 124, 255, 0.12)",
        accentBorder: "rgba(29, 124, 255, 0.35)",
        surface: "#FFFFFF",
    },
    effects: {
        glowShadow: "0px 18px 45px rgba(29, 124, 255, 0.28)",
        focusRing: "0 0 0 4px rgba(29, 124, 255, 0.20)",
    },
    gradients: {
        primaryButton: "linear-gradient(90deg, #1D7CFF 0%, #073B8F 100%)",
        primaryButtonHover: "linear-gradient(90deg, #2A88FF 0%, #0A4DB4 100%)",
        textHighlight: "linear-gradient(90deg, #1D7CFF 0%, #073B8F 100%)",
        radialGlow: "radial-gradient(circle at center, rgba(29,124,255,0.22) 0%, rgba(29,124,255,0.06) 45%, transparent 70%)",
    },
    fonts: {
        primary: "Inter, sans-serif",
    },
};
