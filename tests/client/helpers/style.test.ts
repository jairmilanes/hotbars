import {expect, jest, test} from '@jest/globals';
import { Config } from "#server/core";
import { CliOptions } from "#server/types";

const testCliOptions: CliOptions = {
  env: "test",
  configName: "tests/.hotbarsrc",
};

describe("Helpers", () => {
  describe("Styles", () => {
    beforeAll(() => {
      Config.create(testCliOptions);
    });

    beforeEach(() => {
      jest.restoreAllMocks();
    });

    test("should load by language", () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { styles } = require("#client/_helpers/style")
      const options = {
        data: {
          root: {
            env: "local",
            dev: true,
            dashboard: true
          }
        }
      };

      const result = styles(
        "https://cdnjs.cloudflare.com/ajax/libs/cash/8.1.1/cash[.min].js," +
        "/_dependencies?type=scripts&deps[]=gallery",
        options
      )

      expect(result).toEqual({"string": "/_dependencies?type=scripts&deps[]=gallery"})
    });
  });
});
