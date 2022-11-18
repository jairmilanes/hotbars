import { faker } from "@faker-js/faker/locale/pt_BR";
import { hashSync } from "bcryptjs";
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

export interface PostGenAction {
  type: string;
  value: string | string[] | number | number[] | boolean | null;
}

export interface SchemaConfig {
  size: number;
  name: string;
  schema: { [prop: string]: string };
  mapping?: RalationMapping;
  afterEach?: PostGenAction[];
  afterAll?: PostGenAction[];
}

export type SchemasMap = { [name: string]: SchemaConfig };

export interface FakerConfig {
  module?: string;
  method: string;
  unique?: typeof faker.helpers.unique;
  hash?: typeof hashSync;
  args: any[];
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
