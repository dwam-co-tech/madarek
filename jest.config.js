module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/app', '<rootDir>/components'],
    testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        '!app/**/*.d.ts',
        '!app/**/*.stories.{ts,tsx}',
        '!app/**/__tests__/**',
        '!components/**/*.d.ts',
        '!components/**/*.stories.{ts,tsx}',
        '!components/**/__tests__/**',
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/app/$1',
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                jsx: 'react',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            }
        }]
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
