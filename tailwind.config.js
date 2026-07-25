module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  corePlugins: { preflight: true },
  theme: {
    extend: {
      colors: {
        "app-accent": "var(--app-accent)",
        "backgroundbackground-1": "var(--backgroundbackground-1)",
        "backgroundbackground-2": "var(--backgroundbackground-2)",
        "displaydisplay-1": "var(--displaydisplay-1)",
        "displaydisplay-2": "var(--displaydisplay-2)",
        "displaydisplay-3": "var(--displaydisplay-3)",
        "displaydisplay-4": "var(--displaydisplay-4)",
        "paragraphparagraph-1": "var(--paragraphparagraph-1)",
        "paragraphparagraph-2": "var(--paragraphparagraph-2)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        button: "var(--button-font-family)",
        "display-display-3": "var(--display-display-3-font-family)",
        "display-hero-display": "var(--display-hero-display-font-family)",
        "header-header-1": "var(--header-header-1-font-family)",
        "paragraph-paragraph-2": "var(--paragraph-paragraph-2-font-family)",
        "paragraph-paragraph-3": "var(--paragraph-paragraph-3-font-family)",
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
  },
  plugins: [],
  darkMode: ["class"],
};
