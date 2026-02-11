
import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            animation: {
                'in': 'fade-in 0.5s ease-out',
                'out': 'fade-out 0.5s ease-in',
            },
            colors: {
                cyan: {
                    400: '#22d3ee', // Key brand color
                    900: '#164e63',
                }
            }
        },
    },
    plugins: [require("tailwindcss-animate")],
}
export default config
