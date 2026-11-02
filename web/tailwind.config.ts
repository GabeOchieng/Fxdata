import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // KaziHub brand on an Inngest-grade dark canvas.
        ink: {
          950: "#04060e",
          900: "#080a16",
          850: "#0b0e1d",
          800: "#0e1022",
          700: "#151834",
          600: "#1c2044",
        },
        brand: {
          cyan: "#00e5ff",
          green: "#00ffb3",
          amber: "#f5a623",
          magenta: "#ff2d87",
          violet: "#a78bfa",
          orange: "#ff6b2b",
        },
        line: "rgba(255,255,255,0.08)",
        line2: "rgba(255,255,255,0.14)",
        fg: "#f0eee8",
        muted: "#9a98b5",
        faint: "#5b5f7d",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "1200px",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.04) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,229,255,.10), transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,229,255,.2), 0 8px 40px rgba(0,229,255,.12)",
        card: "0 1px 0 rgba(255,255,255,.04) inset, 0 24px 60px -20px rgba(0,0,0,.7)",
      },
      keyframes: {
        pulseDot: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".35", transform: "scale(.7)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
