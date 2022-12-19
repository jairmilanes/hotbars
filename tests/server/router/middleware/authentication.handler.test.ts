import { CliOptions } from "#server/types";
import { Config } from "#server/core";

const testCliOptions: CliOptions = {
  env: "test",
  configName: "tests/.hotbarsrc",
};

describe("Router", () => {
  describe("Middleware", () => {
    describe("Authentication Handler", () => {
      beforeAll(() => {
        Config.create(testCliOptions);
      });

      test("Should log a user in", () => {
        expect(true).toEqual(true);
      });
    });
  });
});
