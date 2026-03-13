/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-dark': '#060918',
                'primary-green': '#00C853',
                'gold-accent': '#FFD700',
                'deep-navy': '#0a0e27',
                'emerald-glow': '#00E676',
                'section-light': '#0c1024',
                'neon-purple': '#7C3AED',
                'neon-cyan': '#06B6D4',
                'neon-blue': '#3B82F6',
                'surface': '#0f1330',
                'surface-light': '#161b40',
            },
            fontFamily: {
                heading: ['Montserrat', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                accent: ['Orbitron', 'sans-serif'],
            },
            animation: {
                'glow-pulse': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
                'fade-in': 'fadeIn 0.6s ease-out',
                'slide-up': 'slideUp 0.6s ease-out',
                'shimmer': 'shimmer 3s linear infinite',
                'orbit': 'orbit 20s linear infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(124, 58, 237, 0.2), 0 0 20px rgba(124, 58, 237, 0.1)' },
                    '100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.4), 0 0 60px rgba(124, 58, 237, 0.2)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                orbit: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
            },
            backgroundImage: {
                'gradient-dark': 'linear-gradient(135deg, #060918 0%, #0a0e27 50%, #060918 100%)',
                'gradient-green': 'linear-gradient(135deg, #00C853 0%, #00E676 100%)',
                'gradient-hero': 'radial-gradient(ellipse at 50% 0%, #1a1050 0%, #060918 60%)',
                'gradient-purple': 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
                'gradient-mesh': 'radial-gradient(at 20% 80%, rgba(124, 58, 237, 0.15) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(0, 200, 83, 0.1) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)',
            },
        },
    },
    plugins: [],
}
