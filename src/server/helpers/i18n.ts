/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as _ from "lodash";
import util from "handlebars-utils";
import { Config } from "../core";

/**
 * @param {String} `prop`
 * @param {Object} `locals`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

export const i18n = function (
  this: any,
  prop: string,
  locals: object,
  options: object
) {
  if (util.isOptions(locals)) {
    options = locals;
    locals = {};
  }

  if (!_.isString(prop)) {
    throw new Error('{{i18n}} helper expected "key" to be a string');
  }

  const opts = util.options(this, locals, options);
  const context = Object.assign({}, this, opts);
  const lang =
    context.language ||
    context.lang ||
    Config.get("currentLanguage") ||
    Config.get("language.default");

  if (!_.isString(lang) || _.isNil(context[lang])) {
    return _.get(context, prop);
  }

  const result = _.get(context, [lang, prop].join("."));

  if (_.isNil(result)) {
    return `[${prop}]`;
  }

  return result;
};

export const i = i18n;
