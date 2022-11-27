import { Config } from "#server/core";
import { CliOptions } from "#server/types";
import { DataManager, QueryBuilder } from "#server/data";
import { createJsonRouter } from "#server/services";
import { generateData } from "#fake/generate";
import { GeneratedData, SchemaConfig } from "#fake/types";

const testCliOptions: CliOptions = {
  env: "test",
  configName: "tests/.hotbarsrc",
};

const schemaConfigs: SchemaConfig[] = [
  {
    size: 5,
    name: "posts",
    schema: {
      id: "datatype.uuid",
      createdAt: "date.past",
      image: "image.cats",
      title: "lorem.sentence",
      content: "lorem.paragraphs:5",
      comments: "one-to-many:comments.id..4",
    },
  },
  {
    size: 20,
    name: "comments",
    schema: {
      id: "datatype.uuid",
      createdAt: "date.past",
      content: "lorem.paragraphs:2",
      postId: "one-to-one:posts.id",
    },
  },
];

describe("Fake", () => {
  let query: QueryBuilder;
  let data: GeneratedData;

  beforeAll(async () => {
    Config.create(testCliOptions);
    data = generateData(schemaConfigs);
    query = await DataManager.create("jsonDb", createJsonRouter(data).db);
  });

  test("Relation: One to Many", async () => {
    const post = await query.from("posts").gt("comments", 0).single();

    expect(post).toBeTruthy();

    post.comments.forEach((comment: string) => {
      expect(typeof comment).toEqual("string");
      const exists = data.comments.find((cm) => cm.id === comment);
      expect(exists).not.toBeUndefined();
    });
  });
});
