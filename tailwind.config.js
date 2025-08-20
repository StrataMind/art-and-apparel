/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Premium Findora Color Palette
        midnight: '#0B1426',
        coral: '#FF6B6B',
        gold: '#F7B731',
        mint: '#2ED573',
        lavender: '#E8E5FF',
        
        // Minimalist Color Palette
        'minimal-white': '#FFFFFF',
        'minimal-gray': {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        'minimal-accent': '#2563EB',
        
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'primary': ['Inter', 'system-ui', 'sans-serif'],
        'accent': ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' }
        },
        'float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(0px)' }
        },
        'pulse-glow': {
          '0%': { 'box-shadow': '0 0 5px #FF6B6B' },
          '50%': { 'box-shadow': '0 0 20px #FF6B6B, 0 0 30px #FF6B6B' },
          '100%': { 'box-shadow': '0 0 5px #FF6B6B' }
        },
        'shimmer': {
          '0%': { 'background-position': '-200px 0' },
          '100%': { 'background-position': 'calc(200px + 100%) 0' }
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0B1426 0%, #FF6B6B 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #E8E5FF 0%, #FFFFFF 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F7B731 0%, #F39C12 100%)',
        'gradient-coral': 'linear-gradient(135deg, #FF6B6B 0%, #E55353 100%)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}