const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
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
  plugins: [
    require('@tailwindcss/line-clamp'),
    // where:... で :where(...) セレクターを生成するプラグイン
    // 導入経緯・参考: https://zenn.dev/amon/articles/a2f7b7aeecf82e
    plugin(({ addVariant }) => {
      addVariant('where', ':where(&)');
    }),
  ],
};
