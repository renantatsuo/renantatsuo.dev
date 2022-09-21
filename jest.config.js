const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

module.exports = createJestConfig({
  setupFiles: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "~/(.*)": "<rootDir>/$1",
  },
});
