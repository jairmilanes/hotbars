import { loadData } from "#server/utils";
import { Config } from "#server/core";
import { CliOptions } from "#server/types";

const testCliOptions: CliOptions = {
  env: "test",
  configName: "tests/.hotbarsrc",
};

describe("Utils", () => {
  describe("Data Loader", () => {
    beforeAll(() => {
      Config.create(testCliOptions);
    });

    beforeEach(() => {
      jest.restoreAllMocks();
    });

    test("should load by language", () => {
      const data = loadData("data");
      expect(data).toHaveProperty("en");
      expect(data).toHaveProperty("pt-br");
      expect((data as any)["en"]).toHaveProperty("site");
      expect((data as any)["pt-br"]).toHaveProperty("site");
      expect((data as any)["en"]["site"]).toHaveProperty("language");
      expect((data as any)["pt-br"]["site"]).toHaveProperty("language");
      expect((data as any)["en"]["site"]["language"]).toEqual("en");
      expect((data as any)["pt-br"]["site"]["language"]).toEqual("pt-br");
    });

    test("should load data if language is disabled", () => {
      Config.enabled = jest.fn().mockImplementationOnce(() => {
        return false;
      });
      const data = loadData("data");
      expect(typeof data).toEqual("string");
      expect(data).toEqual(Config.fullGlobPath("data"));
    });
  });
});
