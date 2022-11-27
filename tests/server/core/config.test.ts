import { Config } from "#server/core";
import { CliOptions } from "#server/types";

const testCliOptions: CliOptions = {
  env: "test",
  configName: "tests/.hotbarsrc",
};

describe("Config", () => {
  let config: Readonly<Config>;

  test("should create a config instance with defaults", () => {
    config = Config.create(testCliOptions);
    expect(config).toBeInstanceOf(Config);
  });
});
