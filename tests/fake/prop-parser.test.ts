import { Config } from "#server/core";
import { CliOptions } from "#server/types";
import { parsePropConfig } from "#fake/prop-parser";
import { SchemaConfig } from "#fake/types";

const testCliOptions: CliOptions = {
  env: "test",
  configName: "tests/.hotbarsrc",
};

const schemaConfig: SchemaConfig = {
  size: 15,
  name: "topics",
  schema: {
    use: "use:John",
    unique: "unique:name.lastName",
    hash: "hash:internet.password",
    noArgs: "datatype.uuid",
    singleArg: "lorem.paragraphs:5",
    objectArg: "datatype.number:min_18+max_50",
    arrayArg: "lodash.join:prop.firstName+prop.lastName,_",
  },
};

describe("Fake", () => {
  beforeAll(() => {
    Config.create(testCliOptions);
  });

  describe("Property Parser", function () {
    test("parse use helper", () => {
      const config = parsePropConfig("use", schemaConfig.schema["use"]);
      expect(config.method).toEqual("use");
      expect(config.args[0]).toEqual("John");
    });

    test("parse unique helper", () => {
      const config = parsePropConfig("unique", schemaConfig.schema["unique"]);
      expect(config.module).toEqual("name");
      expect(config.method).toEqual("lastName");
      expect(typeof config.unique).toEqual("function");
      expect(config.args).toHaveLength(0);
    });

    test("parse hash helper", () => {
      const config = parsePropConfig("hash", schemaConfig.schema["hash"]);
      expect(config.module).toEqual("internet");
      expect(config.method).toEqual("password");
      expect(typeof config.hash).toEqual("function");
      expect(config.args).toHaveLength(0);
    });

    test("parse noArgs prop", () => {
      const config = parsePropConfig("noArgs", schemaConfig.schema["noArgs"]);
      expect(config.module).toEqual("datatype");
      expect(config.method).toEqual("uuid");
      expect(config.args).toHaveLength(0);
    });

    test("parse singleArg prop", () => {
      const config = parsePropConfig(
        "singleArg",
        schemaConfig.schema["singleArg"]
      );
      expect(config.module).toEqual("lorem");
      expect(config.method).toEqual("paragraphs");
      expect(config.args).toHaveLength(1);
      expect(config.args[0]).toEqual(5);
    });

    test("parse objectArg prop", () => {
      const config = parsePropConfig(
        "objectArg",
        schemaConfig.schema["objectArg"]
      );
      expect(config.module).toEqual("datatype");
      expect(config.method).toEqual("number");
      expect(config.args).toHaveLength(1);
      expect(config.args[0]).toEqual({ min: 18, max: 50 });
    });

    test("parse arrayArg prop", () => {
      const config = parsePropConfig(
        "arrayArg",
        schemaConfig.schema["arrayArg"]
      );
      expect(config.module).toEqual("lodash");
      expect(config.method).toEqual("join");
      expect(config.args).toHaveLength(2);
      expect(config.args[0]).toEqual(["prop.firstName", "prop.lastName"]);
      expect(config.args[1]).toEqual("_");
    });
  });
});
