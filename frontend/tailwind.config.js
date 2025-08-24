/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                heading: {
                    h1: '#1e40af', // Blue-800 for main page titles
                    h2: '#7c3aed', // Purple-600 for section headers
                    h3: '#059669', // Emerald-600 for subsection headers
                    h4: '#dc2626', // Red-600 for important notices
                    h5: '#ea580c', // Orange-600 for alerts/warnings
                    h6: '#6b7280', // Gray-500 for minor headers
                }
            }
        },
    },
    plugins: [],
}
