module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleNameMapper: {
    '\\.scss$': 'identity-obj-proxy',
    '^@components(.*)$': '<rootDir>/src/components/$1',
    '^@constants(.*)$': '<rootDir>/src/constants/$1',
    '^@assets(.*)$': '<rootDir>/src/assets/$1',
    '^@services(.*)$': '<rootDir>/src/services/$1',
    '^@utilities(.*)$': '<rootDir>/src/utilities/$1',
  },
};
