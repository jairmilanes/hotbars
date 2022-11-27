import { RecordKey } from "@faker-js/faker/modules/helpers/unique";
import { faker } from "@faker-js/faker/locale/pt_BR";
import { hashSync } from "bcryptjs";
import { SafeAny } from "../server/types";

export type UniqueCompareCallback = (
  store: Record<RecordKey, RecordKey>,
  key: RecordKey
) => 0 | -1;

export type CompareCallbacks = { [prop: string]: UniqueCompareCallback };

export interface RalationMapping {
  [tableName: string]: {
    [propName: string]: string;
  };
}

export interface PropRelation {
  target: string;
  source?: string;
  size?: number[];
}

export interface PropConfig {
  valid?: boolean;
  prop: string;
  module?: string;
  method: string;
  unique?: typeof faker.helpers.unique;
  hash?: typeof hashSync;
  args: any[];
  relation?: PropRelation;
}

export interface PostGenAction {
  type: string;
  value: string | string[] | number | number[] | boolean | null;
}

export type AfterEachRecordHook = (
  record: GeneratedEntry,
  schemaConfig: SchemaConfig,
  propsConfig: PropsConfig
) => GeneratedEntry;

export type AfterEachSchemaHook = (
  entries: GeneratedEntry[],
  schemaConfig: SchemaConfig,
  propsConfig: PropsConfig
) => GeneratedEntry[];

export type AfterAllHook = (
  data: GeneratedData,
  schemaConfigList: SchemaConfig[],
  props: SchemasPropsMap
) => GeneratedData;

export interface HooksConfig {
  afterRecord?: AfterEachRecordHook;
  afterSchema?: AfterEachSchemaHook;
  afterAll?: AfterAllHook;
}

export interface SchemaConfig {
  size: number;
  name: string;
  schema: { [prop: string]: string };
  relations?: RalationMapping;
  hooks?: {
    afterRecord?: string[];
    afterSchema?: string[];
    afterAll?: string[];
  };
}

export type HookModule = {
  afterRecord: AfterEachRecordHook;
  afterSchema: AfterEachSchemaHook;
  afterAll: AfterAllHook;
};

export type PropsConfig = Record<string, PropConfig>;

export type SchemasPropsMap = Record<string, PropsConfig>;

export interface FlowParams {
  entry: Record<string, SafeAny>;
  config: PropConfig;
}

export interface GeneratedEntry {
  [prop: string]: string | string[] | boolean | number | number[];
}

export type GeneratedData = { [name: string]: GeneratedEntry[] };
