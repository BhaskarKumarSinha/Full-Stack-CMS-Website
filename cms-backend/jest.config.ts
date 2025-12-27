// jest.config.ts
import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 30_000,
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.(ts|tsx)"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
};

export default config;
