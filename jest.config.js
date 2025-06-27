module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['modules/**/services/*.ts'],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
    '^generated/prisma/client$': '<rootDir>/../generated/prisma/client/index.js',
    '^generated/prisma$': '<rootDir>/../generated/prisma/index.ts',
    '^src/modules/prisma/(.*)$': '<rootDir>/modules/prisma/$1',
  },
};
