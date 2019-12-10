module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: ['src/**/*.ts'],
  testMatch: ['**/*.spec.ts'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  }
}
