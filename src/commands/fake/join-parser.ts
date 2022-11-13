import sampleSize from "lodash/sampleSize";
import random from "lodash/random";
import { logger } from "../../lib/services";
import { GeneratedData, GeneratedEntry, SchemaConfig } from "./types";

export class JoinParser {
  private readonly data: GeneratedData;
  private readonly schemaConfig: SchemaConfig;

  constructor(data: GeneratedData, schemaConfig: SchemaConfig) {
    this.data = data;
    this.schemaConfig = schemaConfig;
  }

  generate(): GeneratedData {
    const { schema } = this.schemaConfig;
    const props = Object.keys(schema);

    props.forEach((prop) => {
      if (typeof schema[prop] !== "string") return;

      if (schema[prop as any].startsWith("join:")) {
        const [targetConfig] = schema[prop].split(":").slice(1);
        const [tableConfig, range] = targetConfig.split("-");
        const [tableName, tableProp] = tableConfig.split(".");
        this.join(prop, range, tableName, tableProp);
      }
    });

    return this.data;
  }

  private join(
    prop: string,
    range: string,
    tableName: string,
    tableProp: string
  ) {
    const { name } = this.schemaConfig;
    const [min, max] = range.split(",").map((n: string) => parseInt(n, 10));

    logger.debug(`------ ${prop}: ${min}->${max} of ${tableName}.${tableProp}`);

    this.data[name].forEach((entry: GeneratedEntry) => {
      entry[prop] = sampleSize(
        this.data[tableName],
        random(min, max)
      ).map<string>((ob) => ob[tableProp] as string);
    });
  }
}
