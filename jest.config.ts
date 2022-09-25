import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'node',
    testTimeout: 10000,
    collectCoverageFrom: ['src/**/*.ts', 'src/**/*.js'],
    modulePathIgnorePatterns: ['dist'],
    preset: 'ts-jest',
    clearMocks: true,
};

export default config;
