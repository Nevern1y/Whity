const nextJest = require("next/jest")

const createJestConfig = nextJest({
  dir: "./"
})

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"]
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  testEnvironmentOptions: {
    url: "http://localhost"
  }
}

module.exports = createJestConfig(customJestConfig) 