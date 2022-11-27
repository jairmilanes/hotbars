import * as _ from "lodash";
import { logger } from "../../services";
import {
  GeneratedData,
  GeneratedEntry,
  PropsConfig,
  SchemaConfig,
} from "../types";

export const parseOneToMany = (
  schemaConfig: SchemaConfig,
  propsConfig: PropsConfig,
  data: GeneratedData
) => {
  const { schema } = schemaConfig;

  _.forEach(_.keys(schema), (prop, i) => {
    const { module, valid, relation } = propsConfig[prop];

    if (module === "one-to-many" && valid && relation) {
      const { target, size } = relation;
      const [targetName, targetProp] = _.split(target, ".");
      const [min, max] = (size || []) as number[];
      if (i === 0) logger.update(1);

      logger.debug(`%p%P One-to-Many:%s.%s`, 1, 1, schemaConfig.name, prop);

      _.forEach(data[schemaConfig.name], (entry: GeneratedEntry) => {
        entry[prop] = _.sampleSize(
          data[targetName],
          max ? _.random(min, max) : _.random(min)
        ).map((ob) => _.get(ob, targetProp, "") as any);
      });

      logger.debug(
        `%p%P %s.%s %s%s`,
        3,
        0,
        targetName,
        targetProp,
        min,
        max ? ` to ${max}` : ""
      );

      if (i === 0) logger.update(2);
    }
  });

  logger.update(1);
};
