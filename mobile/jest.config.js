module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts?(x)"],
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
    "^@/(.*)$": "<rootDir>/../$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  watchPathIgnorePatterns: ["<rootDir>/../.next", "<rootDir>/../node_modules"],
};
