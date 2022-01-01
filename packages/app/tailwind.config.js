module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('@tailwindcss/line-clamp')],
  theme: {
    extend: {
      colors: {
        main: 'var(--main)',
        sub: 'var(--sub)',
        back: 'var(--back)',
        back2: 'var(--back-2)',
        shadow: 'var(--shadow)',
        backShadow: 'var(--back-shadow)',
        primary: 'var(--primary)',
        primaryBg: 'var(--primary-bg)',
        primaryGradient: 'var(--primary-gradient)',
        yuku: 'var(--yuku)',
        kuru: 'var(--kuru)',
        danger: 'var(--danger)',
      },
    },
    screens: {
      sm: '640px',
    },
  },
};
