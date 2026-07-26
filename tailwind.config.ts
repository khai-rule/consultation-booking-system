import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      /**
       * All values reference CSS custom properties defined in app/globals.css.
       * Components use semantic classes (bg-surface, text-muted-foreground)
       * not raw palette classes (bg-white, text-slate-500).
       */
      colors: {
        // Surfaces
        background:    "hsl(var(--background))",
        surface:       "hsl(var(--surface))",
        "surface-sunken": "hsl(var(--surface-sunken))",

        // Foreground
        foreground:           "hsl(var(--foreground))",
        "muted-foreground":   "hsl(var(--muted-foreground))",
        "disabled-foreground":"hsl(var(--disabled-foreground))",

        // Primary action (button, selected state, focus ring)
        primary:      "hsl(var(--primary))",
        "primary-hover": "hsl(var(--primary-hover))",
        "primary-fg":    "hsl(var(--primary-fg))",

        // Borders
        border:           "hsl(var(--border))",
        "border-hover":   "hsl(var(--border-hover))",
        "border-disabled":"hsl(var(--border-disabled))",

        // Semantic states
        error: "hsl(var(--error))",

        // Status badge colors
        "status-pending-bg":    "hsl(var(--status-pending-bg))",
        "status-pending-fg":    "hsl(var(--status-pending-fg))",
        "status-confirmed-bg":  "hsl(var(--status-confirmed-bg))",
        "status-confirmed-fg":  "hsl(var(--status-confirmed-fg))",
        "status-completed-bg":  "hsl(var(--status-completed-bg))",
        "status-completed-fg":  "hsl(var(--status-completed-fg))",
        "status-cancelled-bg":  "hsl(var(--status-cancelled-bg))",
        "status-cancelled-fg":  "hsl(var(--status-cancelled-fg))",
      },
      fontSize: {
        // Semantic type scale — matches --text-* tokens in globals.css
        heading: ["var(--text-heading)", { lineHeight: "1.4", fontWeight: "600" }],
        body:    ["var(--text-body)",    { lineHeight: "1.5", fontWeight: "400" }],
        label:   ["var(--text-label)",   { lineHeight: "1.4", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};

export default config;
