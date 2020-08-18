module.exports = {
  setupFiles: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "@components/(.*)": "<rootDir>components/$1",
    "@posts/(.*)": "<rootDir>posts/$1",
    "@lib/(.*)": "<rootDir>lib/$1",
    "@themes/(.*)": "<rootDir>themes/$1",
  },
};
