import { faker } from "@faker-js/faker/locale/pt_BR";
import { RecordKey } from "@faker-js/faker/modules/helpers/unique";
import { CompareCallbacks, FlowParams, UniqueCompareCallback } from "../types";

export let compareCallbacks: CompareCallbacks = {};

const arrayElementUniqueCompare = (maxTries: number): UniqueCompareCallback => {
  let rotation: RecordKey[] = [];
  return (store: Record<RecordKey, RecordKey>, key: RecordKey): 0 | -1 => {
    if (rotation.indexOf(key) === -1) {
      rotation.push(key);
      return -1;
    }

    if (rotation.length === maxTries) {
      rotation = [key];
      return -1;
    }

    return 0;
  };
};

export const resetUniqueCallbacks = () => (compareCallbacks = {});

export const parseElementArray = (params: FlowParams) => {
  const { entry, config } = params;
  const { prop, method, args } = config;

  if (method === "arrayElement") {
    if (!compareCallbacks[prop]) {
      compareCallbacks[prop] = arrayElementUniqueCompare(args.length);
    }

    const options = { compare: compareCallbacks[prop] };
    const fn = faker.helpers.arrayElement;

    entry[prop] = config.unique ? config.unique(fn, [args], options) : fn(args);
  }

  return params;
};
