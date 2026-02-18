
import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                bg: '#EEE8DF',
                primary: '#1A2D42',
                text: '#161616',
                surface: '#f5f1ea',
            },
            fontFamily: {
                base: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                sm: '4px',
                md: '6px',
                lg: '8px',
            },
            transitionDuration: {
                '150': '150ms',
            },
            transitionTimingFunction: {
                ease: 'ease',
            },
        },
    },
    plugins: [],
}
export default config
