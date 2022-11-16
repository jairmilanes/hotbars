import random from "lodash/random";
import { logger } from "../../lib/services";
import { GeneratedData, GeneratedEntry, SchemaConfig } from "./types";

export class RelationParser {
  private readonly data: GeneratedData;
  private readonly schemaConfig: SchemaConfig;

  private targets: {
    source?: { table: string; prop: string };
    target?: { table: string; prop: string };
  } = {};

  constructor(data: GeneratedData, schemaConfig: SchemaConfig) {
    this.data = data;
    this.schemaConfig = schemaConfig;
  }

  generate(): GeneratedData {
    const { name: sourceName, schema } = this.schemaConfig;
    const props = Object.keys(schema);

    props.forEach((prop) => {
      if (typeof schema[prop] !== "string") return;

      if (schema[prop].startsWith("relation:")) {
        const [targetConfig, sourceConfig] = schema[prop].split(":").slice(1);

        this.addTarget("target", targetConfig);
        this.addTarget("source", sourceConfig);

        if (!sourceConfig) {
          logger.debug(
            `------ ${sourceName} => ${this.targets.target?.table}.${this.targets.target?.prop}`
          );
          return this.relateRandomly(prop);
        }

        logger.debug(
          `------ ${this.targets.source?.prop} => ${this.targets.target?.table}.${this.targets.target?.prop}`
        );
        this.relateByProp(prop);
      }
    });

    return this.data;
  }

  private addTarget(type: "target" | "source", propString: string): void {
    if (propString.indexOf(".") === -1) {
      return;
    }

    const [table, prop] = (propString || "").split(".");

    if (!type) {
      if (!this.schemaConfig.mapping || !this.schemaConfig.mapping[table]) {
        return;
      }
    }

    if (!this.data[table]) {
      return;
    }

    (this.targets as any)[type] = { table, prop };
  }

  private relateRandomly(prop: string) {
    if (!this.targets.target) return;

    const { table: targetTable } = this.targets.target;

    this.data[this.schemaConfig.name].forEach((entry: GeneratedEntry) => {
      const target =
        this.data[targetTable][random(0, this.data[targetTable].length - 1)];

      if (target) {
        entry[prop] = target.id;
      }
    });
  }

  private relateByProp(prop: string) {
    if (!this.targets.source || !this.targets.target) {
      return;
    }

    const { table: sourceTable, prop: sourceProp } = this.targets.source;
    const { table: targetTable, prop: targetProp } = this.targets.target;

    this.data[sourceTable].forEach((entry: GeneratedEntry) => {
      if (!this.schemaConfig.mapping) return;
      const normalizedValue = (entry[sourceProp] as string).toLowerCase();

      logger.debug(`------ checking: ${normalizedValue}`);

      const sourceValue =
        this.schemaConfig.mapping[targetTable][normalizedValue];

      const target = this.data[targetTable].find(
        (tableEntry: GeneratedEntry) => {
          return sourceValue === tableEntry[targetProp];
        }
      );

      if (target) {
        entry[prop] = target.id;
      }
    });
  }
}