/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#101828",
        mist: "#eef7f4",
        sea: "#0f766e",
        pulse: "#14b8a6",
        coral: "#f9735b",
        amber: "#f59e0b",
        plum: "#6d5dfc",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(20, 184, 166, 0.18)",
        panel: "0 18px 48px rgba(15, 23, 42, 0.10)",
      },
      animation: {
        scan: "scan 2.4s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.2s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        shimmer: "shimmer 2.6s linear infinite",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-8%)", opacity: "0" },
          "15%": { opacity: "1" },
          "80%": { opacity: "1" },
          "100%": { transform: "translateY(108%)", opacity: "0" },
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.88" },
          "50%": { transform: "scale(1.045)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};
