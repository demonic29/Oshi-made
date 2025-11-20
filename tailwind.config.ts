import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors:{
                border: "hsl(var(--border))"
            },
            fontFamily: {
                'zen-maru-gothic': ['Zen Maru Gothic', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
export default config;