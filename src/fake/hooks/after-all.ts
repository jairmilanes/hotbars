import { GeneratedData, SchemaConfig, SchemasPropsMap } from "../types";

export const afterAll = (
  data: GeneratedData,
  schemaConfigList: SchemaConfig[],
  props: SchemasPropsMap
): GeneratedData => {
  schemaConfigList.forEach((schemaConfig) => {
    const { afterAll } = schemaConfig.hooks || {};

    if (afterAll) {
      afterAll?.forEach((action: string) => {
        console.log(action);
      });
    }
  });

  return data;
};
