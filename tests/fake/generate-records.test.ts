import { Config } from "#server/core";
import { CliOptions } from "#server/types";
import { parsePropConfig } from "#fake/prop-parser";
import { SchemaConfig } from "#fake/types";
import { generateProp } from "#fake/generate-records";

const testCliOptions: CliOptions = {
  env: "test",
  configName: "tests/.hotbarsrc",
};

const schemaConfig: SchemaConfig = {
  size: 15,
  name: "topics",
  schema: {
    use: "use:John",
    unique: "unique:use:Doe",
    hash: "hash:internet.password",
    noArgs: "datatype.uuid",
    singleArg: "lorem.paragraphs:5",
    objectArg: "datatype.number:min_18+max_50",
    arrayArg: "lodash.join:prop.use+prop.unique,_",
    country: "use:Brazil",
    code: "use:BR",
    mustache:
      "helpers.mustache:I'm from {{country}}/{{code}},country_prop.country+code_prop.code",
  },
};

describe("Fake", () => {
  beforeAll(() => {
    Config.create(testCliOptions);
  });

  describe("Property Parser", function () {
    test("parse prop without args", () => {
      const entry: Record<string, any> = {};
      const prop = "noArgs";
      const config = parsePropConfig(prop, schemaConfig.schema[prop]);
      generateProp(entry, config);
      expect(typeof entry[prop]).toEqual("string");
    });

    test("parse pro with single arg", () => {
      const entry: Record<string, any> = {};
      const prop = "singleArg";
      const config = parsePropConfig(prop, schemaConfig.schema[prop]);
      generateProp(entry, config);
      expect(typeof entry[prop]).toEqual("string");
      expect(entry[prop].split("\n").length).toEqual(5);
    });

    test("parse faker helper with object arg", () => {
      const entry: Record<string, any> = {};
      const prop = "objectArg";
      const config = parsePropConfig(prop, schemaConfig.schema[prop]);
      generateProp(entry, config);
      expect(typeof entry[prop]).toEqual("number");
      expect(entry[prop] >= 18 && entry[prop] <= 50).toBe(true);
    });

    test("parse lodash helper with multiple args", () => {
      const entry: Record<string, any> = {};
      const prop = "arrayArg";
      const config = parsePropConfig(prop, schemaConfig.schema[prop]);
      const name = parsePropConfig("use", schemaConfig.schema["use"]);
      const lastName = parsePropConfig("unique", schemaConfig.schema["unique"]);
      generateProp(entry, name);
      generateProp(entry, lastName);
      generateProp(entry, config);
      expect(entry[prop]).toEqual("John_Doe");
    });

    test("parse faker mustache helper with object arg", () => {
      const entry: Record<string, any> = {};
      const prop = "mustache";
      const config = parsePropConfig(prop, schemaConfig.schema[prop]);
      const country = parsePropConfig(
        "country",
        schemaConfig.schema["country"]
      );
      const code = parsePropConfig("code", schemaConfig.schema["code"]);
      generateProp(entry, country);
      generateProp(entry, code);
      generateProp(entry, config);
      expect(typeof entry[prop]).toEqual("string");
      expect(entry[prop]).toBe("I'm from Brazil/BR");
    });
  });
});
