/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from "lodash";
import { logger } from "../../services";
import {
  GeneratedData,
  GeneratedEntry,
  PropConfig,
  PropRelation,
  PropsConfig,
  RalationMapping,
  SchemaConfig,
} from "../types";
import { split } from "../../utils";

const transpile = (prop: string, entry: GeneratedEntry) => {
  const backup = ""+prop
  const r = Object.keys(entry).reduce((ac, key: keyof GeneratedEntry) => {
    return ac.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), entry[key] as any)
  }, prop)
  logger.debug(`%p%P Transpiled: %s => %s`, 3, 0, backup, r);
  return r
}

const parseTarget = (target: string): { table: string; column: string } => {
  const [table, column] = split(target, ".");
  return { table, column };
};

const getMapping = (
  schemaConfig: SchemaConfig,
  relation: PropRelation
): { [key: string]: any } | undefined => {
  const key = _.join([relation.source, relation.target], "-");
  return _.get(schemaConfig.relations, key);
};

const relateRandomly = (propConfig: PropConfig, data: GeneratedData): any => {
  const { table, column } = parseTarget(propConfig.relation?.target as string);
  const value = _.get(
    _.sample(data[table]),
    propConfig.args[0] || column || "id"
  );
  logger.debug(`%p%P Ramdom %s.%s => %s`, 3, 0, table, column, value);
  return value || "";
};

const relateByMapping = (
  entry: GeneratedEntry,
  propConfig: PropConfig,
  mapping: RalationMapping,
  data: GeneratedData
): any => {
  const source = parseTarget(propConfig.relation?.source as string);
  const target = parseTarget(propConfig.relation?.target as string);
  const entryValue = entry[source.column];

  const filteredtargets = _.filter(data[target.table], {
    [target.column]: mapping[entryValue as any],
  });

  if (filteredtargets.length) {
    const value = _.get(_.sample(filteredtargets), propConfig.args[0] || "id");
    logger.debug(
      `%p%P By mapping %s.%s => %s.%s`,
      3,
      0,
      target.table,
      target.column,
      source.table,
      source.column
    );
    return value;
  }

  return "";
};

const relatebyValue = (
  entry: GeneratedEntry,
  propConfig: PropConfig,
  data: GeneratedData
): any => {
  const source = parseTarget(propConfig.relation?.source as string);
  const target = parseTarget(propConfig.relation?.target as string);

  const filteredtargets = _.filter(data[target.table], {
    [target.column]: entry[source.column],
  });

  if (filteredtargets.length) {
    const value = _.get(_.sample(filteredtargets), propConfig.args[0] || "id");
    logger.debug(
      `%p%P By value %s.%s => %s.%s`,
      3,
      0,
      target.table,
      target.column,
      source.table,
      source.column
    );
    return value;
  }

  return "";
};

/**
 * @param propConfig
 * @param schemaConfig
 * @param data
 */
const resolveForProp = (
  propConfig: PropConfig,
  schemaConfig: SchemaConfig,
  data: GeneratedData
) => {
  return _.map(data[schemaConfig.name], (entry: GeneratedEntry, i) => {
    if (i === 0) logger.update(1);

    const relation = _.get(propConfig, "relation") as PropRelation;
    const { source, target } = relation || {};

    const parseConfig = _.merge({}, propConfig, {
      relation: {
        source: source ? transpile(source, entry) : undefined,
        target: transpile(target, entry)
      }
    })

    // if no source was set, it can only be resolved randomly
    if (!source) {
      entry[parseConfig.prop] = relateRandomly(parseConfig, data);
      if (i === 0) logger.update(2);
      return entry;
    }

    const mapping = getMapping(schemaConfig, relation);

    // if source and a relations mapping was set, respect the mapping
    if (mapping) {
      entry[parseConfig.prop] = relateByMapping(
        entry,
        parseConfig,
        mapping,
        data
      );
      if (i === 0) logger.update(2);
      return entry;
    }

    // las attempt to associate by value
    entry[parseConfig.prop] = relatebyValue(entry, parseConfig, data);
    if (i === 0) logger.update(2);
    return entry;
  });
};

export const parseOneToOne = (
  schemaConfig: SchemaConfig,
  propsConfig: PropsConfig,
  data: GeneratedData
) => {
  const { schema } = schemaConfig;

  _.forEach(_.keys(schema), (prop) => {
    const { module, valid, relation } = propsConfig[prop];

    if (module !== "one-to-one" || !valid || !relation) {
      if (module === "one-to-one" && !valid) {
        logger.warn(
          "%p%P Invalid:One-to-One:%s.%s",
          1,
          1,
          schemaConfig.name,
          prop
        );
      }
      return;
    }

    logger.debug(`%p%P One-to-One:%s.%s`, 1, 1, schemaConfig.name, prop);

    resolveForProp(propsConfig[prop], schemaConfig, data);

    logger.update(1);
  });
};
