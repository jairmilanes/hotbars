/* eslint-disable @typescript-eslint/ban-ts-comment */
import util from "handlebars-utils";

function recurse(props: any[], opts: any): string | null {
  if (!props.length) return opts;

  const next = props.shift() as string;

  if (!opts[next]) return null;

  return recurse(props, opts[next]);
}

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
  options: { [key: string]: any }
) {
  if (util.isOptions(locals)) {
    options = locals;
    locals = {};
  }

  if (typeof prop !== "string") {
    throw new Error('{{i18n}} helper expected "key" to be a string');
  }

  const opts = util.options(this, locals, options);
  const context = Object.assign({}, this, opts);
  const lang = context.language || context.lang;

  const parts = prop.split(".").filter(Boolean);

  if (typeof lang !== "string" || !context[lang]) {
    return recurse(parts, options.data.root);
  }

  const result = recurse([lang, ...parts], context);

  if (!result) {
    return `[${prop}]`;
  }

  return result;
};

export const i = i18n;
