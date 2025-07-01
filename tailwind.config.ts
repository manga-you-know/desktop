import { fontFamily } from "tailwindcss/defaultTheme";
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import colors from "tailwindcss/colors";
import layerstack from "@layerstack/tailwind/plugin";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./src/**/*.{html,svelte}",
    "./node_modules/svelte-ux/**/*.{svelte,js}",
  ],
  safelist: ["dark"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        ssm: "620px",
        smh: {
          raw: "(max-height: 1000px)",
        },
      },
      transitionDuration: {
        "200": "200ms",
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--bits-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--bits-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".5" },
        },
        tada: {
          "0%": {
            transform: "scale3d(1, 1, 1)",
          },
          "10%, 20%": {
            transform: "scale3d(0.8, 0.8, 0.8) rotate3d(0, 0, 1, -5deg)",
          },
          "30%, 50%, 70%, 90%": {
            transform: "scale3d(1.3, 1.3, 1.3) rotate3d(0, 0, 1, 5deg)",
          },
          "40%, 60%, 80%": {
            transform: "scale3d(1.3, 1.3, 1.3) rotate3d(0, 0, 1, -5deg)",
          },
          "100%": {
            transform: "scale3d(1, 1, 1)",
          },
        },
        "spinner-grow": {
          "0%": {
            transform: "scale(0)",
          },

          "100%": {
            transform: "none",
            opacity: "1",
          },
        },
        jiggle: {
          "0%": {
            transform: "scale3d(1, 1, 1)",
          },
          "30%": {
            transform: "scale3d(1.25, 0.75, 1)",
          },
          "40%": {
            transform: "scale3d(0.75, 1.25, 1)",
          },
          "50%": {
            transform: "scale3d(1.15, 0.85, 1)",
          },
          "65%": {
            transform: "scale3d(0.95, 1.05, 1)",
          },
          "75%": {
            transform: "scale3d(1.05, 0.95, 1)",
          },
          "100%": {
            transform: "scale3d(1, 1, 1)",
          },
        },
      },
      wiggle: {
        "5%": {
          transform: "rotate(-5deg)",
        },
        "20%": {
          transform: "rotate(5deg)",
        },
        "40%": {
          transform: "rotate(-5deg)",
        },
        "80%": {
          transform: "rotate(5deg)",
        },
      },
      animation: {
        "accordion-down": "accordion-down 600ms ease-out forwards",
        "accordion-up": "accordion-up 600ms ease-out forwards",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        tada: "tada 1s ease-in-out 0.15s 1",
        spinnergrow: "spinner-grow 1s ease-in-out 0.25s 1",
        jiggle: "jiggle 0.6s ease-in-out 0.12s 1",
        wiggle: "wiggle 0.8s ease 0.25s 2",
      },
    },
  },
  ux: {
    themes: {
      light: {
        primary: colors["orange"]["500"],
        "primary-content": "white",
        secondary: colors["blue"]["500"],
        "surface-100": "white",
        "surface-200": colors["gray"]["100"],
        "surface-300": colors["gray"]["300"],
        "surface-content": colors["gray"]["900"],
        "color-scheme": "light",
      },
      dark: {
        primary: colors["orange"]["500"],
        "primary-content": "white",
        secondary: colors["blue"]["500"],
        "surface-100": colors["zinc"]["800"],
        "surface-200": colors["zinc"]["900"],
        "surface-300": colors["zinc"]["950"],
        "surface-content": colors["zinc"]["100"],
        "color-scheme": "dark",
      },
    },
  },
  plugins: [tailwindcssAnimate, layerstack],
};

export default config;
