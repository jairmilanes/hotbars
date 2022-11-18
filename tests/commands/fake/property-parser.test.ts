import { parseProperty } from "hotbars/commands/fake/property-parser";
import { SchemaConfig } from "hotbars/commands/fake/types";
import { initLogger } from "hotbars/lib/services";
import { cliDefaults, Config } from "hotbars";
import { CliOptions } from "hotbars/types";

const testCliOptions: CliOptions = {
  ...cliDefaults,
  env: "test",
  configName: "tests/.hotbarsrc"
}

const config: SchemaConfig = {
  "size": 15,
  "name": "topics",
  "schema": {
    "firstName": "use:John",
    "lastName": "use:Doe",
    "noArgs": "datatype.uuid",
    "singleArg": "lorem.paragraph:5",
    "objectArg": "datatype.number:min_18+max_50",
    "arrayArg": "lodash.join:prop.firstName+prop.lastName,_",
  }
}

describe("Fake", () => {
  beforeAll(() => {
    initLogger(cliDefaults.logLevel, cliDefaults.logFilePath);
    Config.create(testCliOptions);
  })

  describe("Property Parser", function() {
    test('parse faker helper without args', () => {
      const obj: Record<string, any> = {}
      const prop = "noArgs"
      parseProperty(config.schema, obj, prop);
      expect(typeof obj[prop]).toEqual("string")
    })

    test('parse faker helper with single arg', () => {
      const obj: Record<string, any> = {}
      const prop = "singleArg"
      parseProperty(config.schema, obj, prop);
      expect(typeof obj[prop]).toEqual("singleArg")
    })

    test('parse faker helper with object arg', () => {
      const obj: Record<string, any> = {}
      const prop = "objectArg"
      parseProperty(config.schema, obj, prop);
      expect(typeof obj[prop]).toEqual("number")
      expect(obj[prop] >= 18 && obj[prop] <= 50).toBe(true)
    })

    test('parse lodash helper with multiple args', () => {
      const obj: Record<string, any> = {}
      const prop = "arrayArg"
      parseProperty(config.schema, obj, prop);
      expect(obj[prop]).toEqual("John_Doe")
    })
  });
})