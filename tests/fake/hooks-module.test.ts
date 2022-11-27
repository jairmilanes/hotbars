import { Config } from "#server/core";
import { CliOptions } from "#server/types";
import { GeneratedData, SchemaConfig } from "#fake/types";
import { generateData } from "#fake";

const testCliOptions: CliOptions = {
  configName: "tests/.hotbarsrc",
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
    toRemove1: "use:toRemove1",
    toRemove2: "use:toRemove2",
    toRemove3: "use:toRemove3",
  },
  hooks: {
    afterRecord: ["lodash.omit:prop.firstName"],
    afterSchema: ["lodash.omit:prop.lastName"],
    afterAll: ["lodash.omit:prop.username"],
  },
};

describe("Fake", () => {
  let data: GeneratedData;

  beforeAll(() => {
    Config.create(testCliOptions);
    data = generateData([schemaConfig]);
  });

  describe("Hooks: Module", () => {
    test("afterEachRecord", () => {
      data["users"].forEach((user) => {
        expect(user["toRemove1"]).toBeUndefined();
        expect(user["firstName"]).toBeTruthy();
      });
    });

    test("afterEachSchema", () => {
      data["users"].forEach((user) => {
        expect(user["toRemove2"]).toBeUndefined();
        expect(user["lastName"]).toBeTruthy();
      });
    });

    test("afterAll", () => {
      data["users"].forEach((user) => {
        expect(user["toRemove3"]).toBeUndefined();
        expect(user["username"]).toBeTruthy();
      });
    });
  });
});
