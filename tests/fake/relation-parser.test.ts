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
    size: 3,
    name: "posts",
    schema: {
      id: "datatype.uuid",
      createdAt: "date.past",
      image: "image.cats",
      title: "lorem.sentence",
      category: "unique:helpers.arrayElement:Test 1,Test 2,Test 3",
      categorySlug: "helpers.slugify:prop.category",
      content: "lorem.paragraphs:1",
    },
  },
  {
    size: 5,
    name: "comments",
    schema: {
      id: "datatype.uuid",
      createdAt: "date.past",
      content: "lorem.paragraphs:2",
      group: "unique:helper.arrayElement:link1,link2,link3",
      postId: "one-to-one:posts",
      postMappingId: "one-to-one:comments.group-posts.categorySlug",
      postMappingTitle:
        "one-to-one:comments.group-posts.categorySlug,posts.title",
    },
    relations: {
      "comments.group-posts.categorySlug": {
        link1: "Test-1",
        link2: "Test-2",
        link3: "Test-3",
      },
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

  describe("One to One", () => {
    test("should assign random id", async () => {
      const comments = await query.from("comments").all();
      expect(comments.length > 0).toEqual(true);

      comments.forEach((comment: Record<string, any>, i: number) => {
        const post = data["posts"].find((p) => p.id === comment.postId);
        expect(post).not.toBeUndefined();
      });
    });

    test("should assign from relations mapping", async () => {
      const comments = await query.from("comments").all();
      expect(comments.length > 0).toEqual(true);

      comments.forEach((comment: Record<string, any>, i: number) => {
        const post = data["posts"].find((p) => p.id === comment.postMappingId);
        const mapping =
          schemaConfigs[1].relations?.["comments.group-posts.categorySlug"];

        expect(post?.categorySlug).toEqual(mapping?.[comment.group]);
      });
    });

    test("should assign from relations mapping with custom prop", async () => {
      const comments = await query.from("comments").all();
      expect(comments.length > 0).toEqual(true);

      const promises = comments.map(
        async (comment: Record<string, any>, i: number) => {
          const post = await query
            .from("posts")
            .eq("title", comment.postMappingTitle)
            .single();
          expect(post).not.toBeUndefined();
        }
      );

      await Promise.all(promises);
    });
  });
});
