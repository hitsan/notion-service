module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/*.spec.ts"],
  setupFiles: ["./test/setup-tests.ts"],
};
