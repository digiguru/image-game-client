module.exports = {
  clearMocks: true,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  testMatch: [
    '<rootDir>/src/**/*.test.[jt]s?(x)',
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.{js,jsx}',
    '!src/reportWebVitals.js'
  ]
};
