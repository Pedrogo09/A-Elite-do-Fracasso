export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#6366f1",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: 0.6 },
          '50%': { transform: 'translateY(-20px) translateX(10px)', opacity: 1 },
        }
      },
      animation: {
        float: 'float 18s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
