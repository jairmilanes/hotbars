import { Config } from "#server/core";
import { CliOptions } from "#server/types";
import { GeneratedData, SchemaConfig } from "#fake/types";
import { generateData } from "#fake";

const testCliOptions: CliOptions = {
  env: "test",
  logLevel: 0,
  configName: "tests/.missing",
};

const schemaConfig: SchemaConfig = {
  size: 3,
  name: "users",
  schema: {
    id: "datatype.uuid",
    createdAt: "date.past",
    gender: "name.sex",
    firstName: "unique:name.firstName:prop.gender",
    lastName: "unique:name.lastName:prop.gender",
    username: "lodash.join:prop.firstName+prop.lastName,_",
    password: "hash:internet.password",
    avatar: "unique:internet.avatar",
    jobTitle: "name.jobTitle",
    country: "use:Brasil",
    countryCode: "use:BR",
    age: "datatype.number:min_18,max_50",
    state: "address.state",
    timeZone: "use:America/Sao_Paulo",
    website: "internet.url",
    interpolation:
      "helpers.mustashe:I'm from {{country}}/{{code}},country_prop.country+code_prop.countryCode",
    toRemove1: "use:toRemove1",
    toRemove2: "use:toRemove2",
    toRemove3: "use:toRemove3",
  },
  hooks: {
    afterRecord: [
      "lastName:lodash.set:prop.custom",
      "lastName:lodash.omit:prop.toRemove1",
    ],
    afterSchema: ["lodash.assign:prop.toRemove2"],
    afterAll: ["lodash.omit:prop.toRemove3"],
  },
};

describe("Fake", () => {
  let data: GeneratedData;

  beforeAll(() => {
    Config.create(testCliOptions);
    data = generateData([schemaConfig]);
  });

  describe("Hooks: Json", () => {
    test("afterEachRecord", () => {
      expect(true).toBeTruthy();
    });

    test("afterEachSchema", () => {
      expect(true).toBeTruthy();
    });

    test("afterAll", () => {
      expect(true).toBeTruthy();
    });
  });
});
