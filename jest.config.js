module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!@nestjs-modules/ioredis)'],
  collectCoverageFrom: ['modules/**/services/*.ts'],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
    '^generated/prisma/client$':
      '<rootDir>/../generated/prisma/client/index.js',
    '^generated/prisma(.*)$': '<rootDir>/../generated/prisma/client$1',
    '^src/modules/prisma/(.*)$': '<rootDir>/modules/prisma/$1',
  },
  clearMocks: true,
  collectCoverage: true,
  coverageThreshold: {
    global: { branches: 97, functions: 97, lines: 97, statements: 97 },
  },
};
