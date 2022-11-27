/* eslint-disable @typescript-eslint/no-explicit-any */
import { Config } from "#server/core";
import { CliOptions, Env } from "#server/types";
import { DataManager, QueryBuilder } from "#server/data";
import { DataAdapterNotFoundException } from "#server/exceptions";

const testCliOptions: CliOptions = {
  env: Env.Test,
  configName: "tests/.hotbarsrc",
};

const record: Record<string, any> = {
  id: "999f7e52-fe39-4f65-9857-acc7bc0c999",
  createdAt: "2022-02-23T17:07:23.703Z",
  gender: "Feminino",
  firstName: "Dummy",
  lastName: "Dummy",
  username: "Dummy_Dummy",
  passwordUnhashed: "fZsTr_EqSLcFMfS",
  password: "$2a$10$Cnvn9zuIzZk6rQRYkOgWhu6RBBS1tgItjkjTGJHfk0cINenA1s66u",
  avatar:
    "https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/357.jpg",
  jobTitle: "Direto Dados Atentende",
  country: "Brasil",
  countryCode: "BR",
  age: 43,
  state: "Pará",
  timeZone: "America/Sao_Paulo",
  website: "http://flaky-notice.net",
};

describe("Data Manager", () => {
  let config: Readonly<Config>;
  let manager: QueryBuilder;

  beforeAll(() => {
    config = Config.create(testCliOptions);
  });

  test("should error if adapter does not exist", async () => {
    try {
      await DataManager.create("notFoundAdapter");
    } catch (e) {
      expect(e).toBeInstanceOf(DataAdapterNotFoundException);
    }
  });

  test("should create a jsonDb adapter", async () => {
    const msg = await DataManager.create("jsonDb");
    expect(msg).toBeInstanceOf(QueryBuilder);
  });

  test("should return instance of loaded adapter", async () => {
    const adapter = DataManager.get("jsonDb");
    expect(adapter).toBeInstanceOf(QueryBuilder);
  });

  describe("Query Builder", () => {
    beforeAll(async () => {
      manager = await DataManager.create("jsonDb");
    });

    test("should return an user by id", async () => {
      const user = await manager
        .from("users")
        .get("4a70a406-fd31-4adb-8fcd-a90cd4eff556");
      expect(user.id).toEqual("4a70a406-fd31-4adb-8fcd-a90cd4eff556");
    });

    test("should find user whenre id equals id", async () => {
      const user = await manager
        .from("users")
        .eq("id", "4a70a406-fd31-4adb-8fcd-a90cd4eff556")
        .single();
      expect(user.id).toEqual("4a70a406-fd31-4adb-8fcd-a90cd4eff556");
    });

    test("should return users for neq query", async () => {
      const users = await manager
        .from("users")
        .neq("id", "4a70a406-fd31-4adb-8fcd-a90cd4eff556")
        .all();
      expect(
        users.every(
          (u: Record<string, any>) =>
            u.id !== "4a70a406-fd31-4adb-8fcd-a90cd4eff556"
        )
      ).toEqual(true);
    });

    test("should return null if user does not exist", async () => {
      const user = await manager.from("users").eq("id", "4a70a406").single();
      expect(user).toEqual(undefined);
    });

    test("should return users for gt query", async () => {
      const users = await manager.from("users").gt("age", 30).all();
      expect(users.every((u: Record<string, any>) => u.age > 30)).toEqual(true);
    });

    test("should return users for lt query", async () => {
      const users = await manager.from("users").lt("age", 30).all();
      expect(users.every((u: Record<string, any>) => u.age < 30)).toEqual(true);
    });

    test("should return users for gte query", async () => {
      const users = await manager.from("users").gte("age", 44).all();
      expect(users.every((u: Record<string, any>) => u.age >= 44)).toEqual(
        true
      );
    });

    test("should return users for lte query", async () => {
      const users = await manager.from("users").lte("age", 24).all();
      expect(users.every((u: Record<string, any>) => u.age <= 24)).toEqual(
        true
      );
    });

    test("should return users for in query", async () => {
      const users = await manager.from("users").in("age", [24, 19, 39]).all();
      expect(
        users.every(
          (u: Record<string, any>) => [24, 19, 39].indexOf(u.age) !== -1
        )
      ).toEqual(true);
    });

    test("should return users for nin query", async () => {
      const users = await manager.from("users").nin("age", [24, 19, 39]).all();
      expect(
        users.every(
          (u: Record<string, any>) => [24, 19, 39].indexOf(u.age) === -1
        )
      ).toEqual(true);
    });

    test("should return limit results", async () => {
      const users = await manager.from("users").limit(3);
      expect(users.length === 3).toEqual(true);
    });

    test("should return offset results", async () => {
      const all = await manager.from("users").all();
      const users = await manager.from("users").offset(3).all();
      expect(users[0].username).toEqual(all[2].username);
    });

    test("should insert a and delete record", async () => {
      const { id, ...rec } = record;
      const db = manager.from("users");
      const row = await db.insert(rec);
      const newRow = await db.get(row.id);
      expect(row.id).toEqual(newRow.id);
      await db.delete(newRow.id);
      const deleted = await db.get(newRow.id);
      expect(deleted).toBeUndefined();
    });

    test("should update a record", async () => {
      const db = manager.from("users");
      const record = await db.single();
      const oldUsername = record.firstName;
      const row = await db.update(record.id, { firstName: "Test" });
      expect(row.firstName).toEqual("Test");
      const original = await db.update(row.id, { firstName: oldUsername });
      expect(original.firstName).toEqual(oldUsername);
    });

    test("should update records where", async () => {
      const db = manager.from("users");
      const rows = await db.updateWhere(
        { gender: "Masculino" },
        { countryCode: "US" }
      );
      expect(rows.every((r) => r.countryCode === "US")).toBeTruthy();
      const originals = await db.updateWhere(
        { gender: "Masculino" },
        { countryCode: "BR" }
      );
      expect(originals.every((r) => r.countryCode === "BR")).toBeTruthy();
    });

    test("should delete records where", async () => {
      const db = manager.from("users");
      const rows = await db.deleteWhere({ gender: "Masculino" });
      const deleted = await db.eq("gender", "Masculino").all();
      expect(deleted.length).toEqual(0);
      await setTimeout(() => null, 1000);
      await Promise.all(rows.map((row: Record<string, any>) => db.insert(row)));
      const reInstaded = await db.eq("gender", "Masculino").all();
      expect(reInstaded.length).toEqual(rows.length);
    });
  });
});
