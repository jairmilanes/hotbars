import { CliOptions } from "#server/types";
import { Config } from "#server/core";
import { BootstrapData } from "#server/services";

const testCliOptions: CliOptions = {
  env: "test",
  configName: "tests/.hotbarsrc",
};

describe("Bootstrap", () => {
  beforeAll(() => {
    Config.create(testCliOptions);
  });

  test("should load bootstrap file", async () => {
    const data = await BootstrapData.load();
    expect(data).toHaveProperty("message");
    expect(data["message"]).toEqual("Project bootstraped!");
    expect(BootstrapData.get()).toEqual(data);
  });
});
