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
            colors: {
                heading: {
                    h1: '#ffffff', // Pure white for main page titles - high contrast
                    h2: '#e0e7ff', // Light blue-white for section headers
                    h3: '#f3e8ff', // Light purple-white for subsection headers
                    h4: '#fef3c7', // Light yellow for important notices
                    h5: '#fecaca', // Light red for alerts/warnings
                    h6: '#d1d5db', // Light gray for minor headers
                }
            }
        },
    },
    plugins: [],
}
