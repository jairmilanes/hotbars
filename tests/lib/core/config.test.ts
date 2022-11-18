import { cliDefaults, Config } from "hotbars";
import { CliOptions } from "hotbars/types";

const testCliOptions: CliOptions = {
  ...cliDefaults,
  env: "test",
  configName: "tests/.hotbarsrc"
}

describe('Config', () => {
  let config: Readonly<Config>;

  test('should create a config instance with defaults', () => {
    config = Config.create(testCliOptions);
    expect(config).toBeInstanceOf(Config);
  })
})