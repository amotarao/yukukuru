module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('@tailwindcss/line-clamp')],
  theme: {
    screens: {
      sm: '640px',
    },
    extend: {
      colors: {
        main: 'var(--main)',
        sub: 'var(--sub)',
        back: 'var(--back)',
        'back-2': 'var(--back-2)',
        shadow: 'var(--shadow)',
        'back-shadow': 'var(--back-shadow)',
        primary: 'var(--primary)',
        'primary-bg': 'var(--primary-bg)',
        'primary-gradient': 'var(--primary-gradient)',
        yuku: 'var(--yuku)',
        kuru: 'var(--kuru)',
        danger: 'var(--danger)',
      },
      backgroundImage: {
        'top-bg': 'var(--primary-gradient)',
      },
    },
  },
};
