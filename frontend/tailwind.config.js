import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import('tailwindcss').Config} */
const configDir = dirname(fileURLToPath(import.meta.url))

export default {
    content: [
        resolve(configDir, "index.html"),
        resolve(configDir, "src/**/*.{js,ts,jsx,tsx}"),
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
            },
        },
    },
    plugins: [],
}
