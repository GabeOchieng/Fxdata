/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
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
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      maxWidth: { content: "1200px" },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.04) 1px, transparent 1px)",
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
      },
      animation: {
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};
