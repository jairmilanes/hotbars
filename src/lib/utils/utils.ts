import { SafeAny } from "../../types";

export const isObject = (values: SafeAny) => {
  return (
    typeof values === "object" && !Array.isArray(values) && values !== null
  );
};
