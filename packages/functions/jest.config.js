module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec).+(ts|js)'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  setupFiles: ['<rootDir>/dotenv-config.js'],
};
