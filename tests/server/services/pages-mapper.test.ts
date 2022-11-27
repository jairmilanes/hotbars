import { CliOptions, SafeObject } from "#server/types";
import { Config } from "#server/core";
import { mapPages } from "#server/services";

const testCliOptions: CliOptions = {
  env: "test",
  configName: "tests/.hotbarsrc",
};

describe("Services", () => {
  describe("Pages Mapper", () => {
    let pages: SafeObject;

    beforeAll(() => {
      Config.create(testCliOptions);

      pages = mapPages(
        Config.relPath("views"),
        Config.get("extname"),
        Config.get("auth.securePath")
      );
    });

    test("should map path params", () => {
      expect(pages).toHaveProperty("/profile/:id");
    });

    test("should params in folder name", () => {
      const path = "/store/:name";
      expect(pages).toHaveProperty(path);
      expect(pages[path]).toEqual("store/[name]/index");
    });

    test("should map multiple path params", () => {
      const path = "/store/:name/product/:id";
      expect(pages).toHaveProperty(path);
      expect(pages[path]).toEqual("store/[name]/product/[id]/index");
    });

    test("should remove secure path from endpoint", () => {
      const path = "/profile/:id";
      const hasSecurePath = Object.keys(pages).some(
        (path) => path.indexOf(`/${Config.get("auth.securePath")}`) > -1
      );
      expect(hasSecurePath).toEqual(false);
      expect(pages).toHaveProperty(path);
      expect(pages[path]).toEqual(
        `${Config.get("auth.securePath")}/profile/[id]`
      );
    });
  });
});
