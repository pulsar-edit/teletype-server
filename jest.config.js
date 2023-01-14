const config = {
  projects: [
    {
      displayName: "Controller",
      globalSetup: "<rootDir>/node_modules/@databases/pg-test/jest/globalSetup",
      globalTeardown: "<rootDir>/node_modules/@databases/pg-test/jest/globalTeardown",
      testMatch: ["<rootDir>/test-jest/*.test.js"]
    }
  ]
};

module.exports = config;
