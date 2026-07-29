/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0b0f",
        panel: "#12141b",
        panel2: "#171a23",
        border: "#262b38",
        "border-soft": "#1c202b",
        ink: "#e8ecf4",
        "ink-dim": "#8890a3",
        "ink-mute": "#4b5265",
        amber: "#ffb648",
        "amber-dim": "#8a6329",
        cyan: "#5eead4",
        "bpm-red": "#ff5d5d",
        "sv-green": "#59e878",
        kiai: "#ffd166",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
