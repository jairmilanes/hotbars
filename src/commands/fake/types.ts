import { faker } from "@faker-js/faker/locale/pt_BR";
import { SafeAny } from "../../types";
import { RecordKey } from "@faker-js/faker/modules/helpers/unique";

export type UniqueCompareCallback = (
  store: Record<RecordKey, RecordKey>,
  key: RecordKey
) => 0 | -1;

export type CompareCallbacks = { [prop: string]: UniqueCompareCallback };

export type Schema = { [prop: string]: string };

export interface RalationMapping {
  [tableName: string]: {
    [propName: string]: string;
  };
}

export interface SchemaConfig {
  size: number;
  name: string;
  schema: { [prop: string]: string };
  mapping?: RalationMapping;
}

export type SchemasMap = { [name: string]: SchemaConfig };

export interface FakerConfig {
  method: string;
  unique?: typeof faker.helpers.unique;
  args?: string;
}

export interface FlowParams {
  prop: string;
  obj: Record<string, SafeAny>;
  config: FakerConfig;
}

export interface GeneratedEntry {
  [prop: string]: string | string[] | boolean | number | number[];
}

export type GeneratedData = { [name: string]: GeneratedEntry[] };
