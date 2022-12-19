const util = require("handlebars-utils");
function recurse(props, opts) {
  if (!props.length) return opts;

  const next = props.shift();

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
module.exports.i18n = function (prop, locals, options) {
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

module.exports.i = module.exports.i18n;
