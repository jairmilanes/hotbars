import * as _ from "lodash";

export const split = (str: string, char: string) =>
  _.filter(_.split(str, char), (s) => !_.isEmpty(s));
