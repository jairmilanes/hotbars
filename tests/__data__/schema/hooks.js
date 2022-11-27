const _ = require("lodash");

const afterRecord = (record, schemaConfig, propsConfig) => {
  return _.omit(record, ["toRemove1"]);
};

const afterSchema = (entries, schemaConfig, propsConfig) => {
  return _.map(entries, _.partialRight(_.omit, ["toRemove2"]));
};

const afterAll = (data, schemaConfigs, propConfigs) => {
  return _.reduce(
    _.keys(data),
    (newData, schemaName) => ({
      ...newData,
      [schemaName]: _.map(
        data[schemaName],
        _.partialRight(_.omit, ["toRemove3"])
      ),
    }),
    {}
  );
};

module.exports = {
  afterRecord,
  afterSchema,
  afterAll,
};
