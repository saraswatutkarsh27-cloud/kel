import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-base": "var(--bg-base)",
        "bg-surface": "var(--bg-surface)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-hover": "var(--bg-hover)",
        "bg-active": "var(--bg-active)",
        "border-subtle": "var(--border-subtle)",
        "border-default": "var(--border-default)",
        "border-strong": "var(--border-strong)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-accent": "var(--text-accent)",
        "color-error": "var(--color-error)",
        "color-warning": "var(--color-warning)",
        "color-success": "var(--color-success)",
        "color-info": "var(--color-info)",
        "color-ai": "var(--color-ai)",
        "agent-plan": "var(--agent-plan)",
        "agent-tool": "var(--agent-tool)",
        "agent-result": "var(--agent-result)",
        // Legacy aliases for backward compat (reference CSS variables)
        ide: {
          bg: "var(--bg-base)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
          border: "var(--border-default)",
          hover: "var(--bg-hover)",
          accent: "var(--text-accent)",
          "accent-light": "var(--text-accent)",
          "accent-dim": "#0288d1",
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          danger: "var(--color-error)",
          muted: "var(--text-muted)",
          subtle: "var(--text-secondary)",
        },
      },
      fontFamily: {
        sans: ["Geist", "SF Pro Display", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "slide-down": "slideDown 0.25s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "bounce-subtle": "bounceSubtle 0.3s ease-out",
        "typing-dot": "typingDot 1.4s infinite ease-in-out",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(79, 195, 247, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(79, 195, 247, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceSubtle: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        typingDot: {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
      },
      boxShadow: {
        glow: "0 0 15px rgba(79, 195, 247, 0.3)",
        "glow-lg": "0 0 30px rgba(79, 195, 247, 0.4)",
        "glow-sm": "0 0 8px rgba(79, 195, 247, 0.2)",
        "inner-glow": "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
