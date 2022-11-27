## Fake Api

With Hotbars you can start developing as soon as your idea comes to mind, no need to wait for backend or figure out the whole data structure beforehand, you can easely generate advanced stub data to work with and re-generate whenever you make any updates.

### Configuration

By default, Hotbars Fake command will look for a `src/schema` directory to read your schemas from, you may change this behavior using your `.hotbarsrc` configuration file like below:

```json5
// .hotbarsrc
{
  //...other config properties
  source: "custom-src-dir",
  dbSchema: "custom-schema-dir",
}
```

this will make Hotbars Fake look for your schemas in `custom-src-dir/custom-schema-dir`.

By default, Hotbars Fake will use `src/db/db.json` path to save your generated json data file, you may change this location by changing the `dbPath` in your configuration file:

```json5
// .hotbarsrc
{
  //...other config properties
  source: "custom-src-dir",
  dbSchema: "custom-schema-dir",
  dbPath: "json-db-dir/database.json",
}
```

This would save your generated json data file in `custom-src-dir/json-db-dir/database.json`.

Keep in mind that changing your `source` configuration will affect all other directory based configuration of Hotbars, like views, layouts, partials, controllers and others.

### Schemas format

To begin generating your data you first need some schemas, their format is easy to understand and quick to create, here is a couple of examples:

```json5
// src/schema/posts.json
{
  // The number of entries to create
  size: 30,
  // The name of this schema, will use the file name
  // as a fallback if not present
  name: "posts",
  // The properties definition
  schema: {
    id: "datatype.uuid",
    createdAt: "date.past",
    image: "image.cats",
    title: "lorem.sentence",
    content: "lorem.paragraphs:5",
  },
}
```

For the purpouse of this example, let's create another schema:

```json5
// src/schema/comments.json
{
  size: 60,
  name: "comments",
  schema: {
    id: "datatype.uuid",
    createdAt: "date.past",
    content: "lorem.paragraphs:1..3",
  },
}
```

**Note**: It is higly recomended that you begin each of your schemas with an **id** property, most if not all databases uses id's to uniquely identify records, and is specially usefull when using relationships, which you will seem later in this page, so unless you have some very specific use case in mind, assign each schema a id property of type `datatype.uuid`.

Next run the fake cli command to generate your `db.json` file:

```shell
hotbars fake
```

This will generate a json file with 30 posts and 60 comments and save it all to the db.json file.
w

### Property Values

Notice in the exaple above we generated different types of property values, Hotbars makes use of Faker.js and Lodash to make generation fake data as flexible and as powerfull as we can.

The format for each property should be as follows:

```shell
<module>.<helper>:<arg1,arg2,...argN>
```

Where:

- **module** can be one of _Lodash_ or of Faker's module names, like _lorem_, _name_, _datatype_, and so on, please visit the Faker'js website for all options.
  - **helper** one of Lodash's helpers or Faker's helpers for the choosen module, like _name.lastName_.
- **args** are separated by coma, where each can take on of 3 formats:
  - text, number or boolean in string format
  - array, where each member is separated by "+", like `arg1+arg2+arg3`
  - object, where each prop/value group is separated by a "+", like `arg_1+arg_2+arg_3`

Here is a few examples:

`datatype.uuid` uses Faker's to generate a uuid string
`lorem.paragraphs:1..5` uses Faker's to generate 1 to 5 lorem ipsum paragrams
`datatype.number:min_18+max_50` uses Faker's to generate a randum number beetwen 18 and 50

Args can also reference properties of the same record by prefixing with `prop.`:
`lodash.join:prop.firstName+prop.lastName,_` uses Lodash to join two properties `firstName` and `lastName` with a `_`.
`use:Value` the `use` keyword will apply the first argument as the property value without any modifications.

## Relationships

Relationships allow you to connect records to one another, by default Hotbars Fake uses the available id property

### One-to-one

To create a one-to-one relationship beetwen two collections use the `one-to-one` keyword:  
`postId: one-to-one:posts` this will create a one-to-one relationship to a random post by id.

In case you don't want random but have some other information that must match, you may use a mapping:

```json5
// src/schema/comments.json
{
  size: 10,
  name: "comments",
  schema: {
    id: "datatype.uuid",
    //...other props
    type: "helpers.arrayElement:product,place,thing",
    categoryId: "one-to-one:comments.type-posts.category",
  },
  relations: {
    "comments.type-posts.category": {
      product: "shooping",
      place: "travel",
      thing: "hobby",
    },
  },
}
```

The above example will assign a post id from a post that matches the mapping, so for a comment of type `product`, it will get an id from a post that has a category value of `shopping`, and so on.

You may also pass in a second argument for another property to use as value instead of the default `id`:

```json5
// src/schema/comments.json
{
  size: 10,
  name: "comments",
  schema: {
    id: "datatype.uuid",
    //...other props
    type: "helpers.arrayElement:product,place,thing",
    postTitle: "one-to-one:comments.type-posts.category,posts.title",
  },
  relations: {
    "comments.slug-categories.slug": {
      product: "shooping",
      place: "travel",
      thing: "hobby",
    },
  },
}
```

The above example will assign to `postTitle` the title of a post that matches the mapping, so a comment of type `place` will get a post title from a post with a category of `travel`.

### One-to-many

Creating a one-to-many relationship is just as easy:  
`comments: one-to-many:comments:5` will assign exactly 5 comment ids to the `comments` property.

`comments: one-to-many:comments:0..20` this will assing beetwen 0 and 20 comment ids to the ` comments` property.

`comments: one-to-many:comments:0..10,comments.title` this will assing beetwen 0 and 20 comment titles to the `comments` property.

## Serving your data

Hatbars Fake was intended to be used with the available **Hotbars Mock Server**, which would use your generated json data file as a database, and provide a full **REST** **CRUD** api for fast project development, but you are not required to do so, and choose other means to serve the data.

You can enable the **Hotbars Mock Server** in your configuration file:

```json5
// .hotbarsrc
{
  //...
  mockServer: {
    enabled: true,
    // ...other mock server configuration
  },
  dbSchema: "custom-schema-dir",
  dbPath: "json-db-dir/database.json",
  // ...
}
```

The above configuration would enable the **Hotbars Mock Server** which would look for the db json file in `src/custom-schema-dir/json-db-dir/database.json`, and make the data available through the `/_api` endpoint for **CRUD** operations.

See the **Hotbars Mock Server** documentation for more information on how it works and how to customize it.

## Hooks

Hooks allow you to do work after data has been generated, Hotbars Fake provides 3 hooks:

**afterRecord** Runs after each record is generated
**afterSchema** Runs after all records for a schema are generated
**afterAll** Runs after all records schemas have been generated

To configure hooks, create a file named `hooks.js` under your schemas directory, and export a named function for one or more hooks as needed:

```javascript
const _ = require("lodash");

/**
 * @param {Record} record The generated record
 * @param {Object} schemaConfig The schema configuration
 * @param {Object} propsConfig The parsed properties of the schema
 * @returns {Record} The muted record.
 */
const afterRecord = (record, schemaConfig, propsConfig) => {
  return record;
};

/**
 * @param {Record[]} records The generated records
 * @param {Object} schemaConfig The schema configuration
 * @param {Object} propsConfig The parsed properties of the schema
 * @returns {Record} The muted record.
 */
const afterSchema = (records, schemaConfig, propsConfig) => {
  return records;
};

/**
 * @param {Object} data The generated data, where key is the schema name, and value are the generated records.
 * @param {Object} schemaConfig A map of all schemas
 * @param {Object} propsConfig A map of all parsed properties
 * @returns {Record} The muted record.
 */
const afterAll = (data, schemaConfigs, propConfigs) => {
  return data;
};

module.exports = {
  afterEachRecord,
  afterEachSchema,
  afterAll,
};
```
