## Data Access & Management

Hotbars provides a unified way to manage you app data, you may choose to go completly custom, but we highly recomend implementing the provided `QueryBuilder` interface, this allows you to manage multiple data sources with easy by using the data registry and `DataManager` class.

The `DataManager` can be extended through the creation of adaptor classes, which must extend from `QueryBuilder` and implement the required methods.

For development pourpouses we provided a [LowDb](https://github.com/typicode/lowdb) data adaptor, which is a json based database that allows you to create a database out of local json files.

### Generating data

To make it easy to get started, Hotbars provides a cli command that makes heavy use of [Faker.js](https://fakerjs.dev/) and [Lodash](https://lodash.com/) to allow you to create simple schema files, that are used to generate fake data to use while developing your app.

This data is than made available through the `/_api` endoint which allows you to query and persist records in your json database file.

To generate data, start by creating a schema file:

```json5
{
  "size": 5,
  "name": "posts",
  "schema": {
    "complete": "use:false",
    "title": "lorem.sentence",
    "post": "system.commonFileName:md"
  }
}
```

The schema requires 3 properties:
* **size** The number of entries to be generated for this schema
* **name** The name used as the table name
* **schema** The properties each record will have.

### Properties

Each property under schema follows the following format:

```shell
<module>.<helper>:<arg1,arg2,...argsN>
```
* **library** can be either `lodash` or one of the module names in fake, like `lorem`, `name`, `system`.
* **helper** the name of one of the helper functions profided by the library.
* **args** a comma separated list of arguments that will be passed to the helper

There is some limitation on the arguments passed, like currently there is no way of passing Object like arguments, only strings, other data types like numbers and boolean will be coerced to primitives during the generation.

Arguments may also be properties of the record it self, given the following schema:
```json5
{
  "size": 5,
  "name": "posts",
  "schema": {
    "title": "lorem.sentence",
    "slug": "helpers.slugify:prop.title",
    "content": "lorem.paragraphs:5"
  }
}
```
the Faker.js helper `slugify` will be passes the current record `title` property value as argument, the only rule here, is that the property being passed must have been configured before the one which is using it.

Some other examples of properties:

```json5
{
  "id": "datatype.uuid",
  "createdAt": "date.past", // Faker.js helper method without args
  "gender": "name.sex", // Faker.js helper without args
  "firstName": "unique:name.firstName",
  "lastName": "unique:name.lastName:prop.gender",
  "username": "lodash.join:prop.firstName,prop.lastName _",
  "password": "hash:internet.password",
  "avatar": "unique:internet.avatar",
  "jobTitle": "name.jobTitle",
  "country": "use:Brasil",
  "countryCode": "use:BR",
  "age": "datatype.number:min_18,max_50",
  "state": "address.state",
  "timeZone": "use:America/Sao_Paulo",
  "website": "internet.url"
}
```
