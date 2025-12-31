import aspectRatio from "@tailwindcss/aspect-ratio";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import animate from "tailwindcss-animate";

export default {
    darkMode: [ `class` ],
    content:  [ `./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}` ],
    theme:    {
        extend: {
            fontFamily: {
                sans: [
                    `Nunito Variable`,
                    ...defaultTheme.fontFamily.sans,
                ],
            },
            animation:  {
                "bounce-horizontal": `bounce-horizontal 2s infinite`,
            },
            keyframes:  {
                "bounce-horizontal": {
                    "0%, 100%": {
                        transform:               `translateX(-25%)`,
                        animationTimingFunction: `cubic-bezier(0.8, 0, 1, 1)`,
                    },
                    "50%":      {
                        transform:               `none`,
                        animationTimingFunction: `cubic-bezier(0, 0, 0.2, 1)`,
                    },
                },
            },
            borderRadius: {
                lg: `var(--radius)`,
                md: `calc(var(--radius) - 2px)`,
                sm: `calc(var(--radius) - 4px)`,
            },
            colors: {
                background: `hsl(var(--background))`,
                foreground: `hsl(var(--foreground))`,
                card:       {
                    DEFAULT:    `hsl(var(--card))`,
                    foreground: `hsl(var(--card-foreground))`,
                },
                popover: {
                    DEFAULT:    `hsl(var(--popover))`,
                    foreground: `hsl(var(--popover-foreground))`,
                },
                primary: {
                    DEFAULT:    `hsl(var(--primary))`,
                    foreground: `hsl(var(--primary-foreground))`,
                },
                secondary: {
                    DEFAULT:    `hsl(var(--secondary))`,
                    foreground: `hsl(var(--secondary-foreground))`,
                },
                muted: {
                    DEFAULT:    `hsl(var(--muted))`,
                    foreground: `hsl(var(--muted-foreground))`,
                },
                accent: {
                    DEFAULT:    `hsl(var(--accent))`,
                    foreground: `hsl(var(--accent-foreground))`,
                },
                destructive: {
                    DEFAULT:    `hsl(var(--destructive))`,
                    foreground: `hsl(var(--destructive-foreground))`,
                },
                border: `hsl(var(--border))`,
                input:  `hsl(var(--input))`,
                ring:   `hsl(var(--ring))`,
                chart:  {
                    1: `hsl(var(--chart-1))`,
                    2: `hsl(var(--chart-2))`,
                    3: `hsl(var(--chart-3))`,
                    4: `hsl(var(--chart-4))`,
                    5: `hsl(var(--chart-5))`,
                },
            },
        },
    },
    plugins:  [
        forms,
        typography,
        aspectRatio,
        animate,
    ],
} as Config;
