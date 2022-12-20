const clsx = require("clsx");
const isObject = (value) => value !== null && typeof value === "object";
const isBoolean = (maybeBoolean) => typeof maybeBoolean === "boolean";
const toStringIfBoolean = (value) => (isBoolean(value) ? String(value) : value);
const isSimpleSubset = (a, b) =>
  Object.entries(a).every(([key, value]) => b[key] === value);

/**
 * Removes undefined values recursively.
 */
const normalize = (obj, cb = (k, v) => v) => {
  return Object.keys(obj)
    .reduce((result, key) => {
      if (!/^_/.test(key) && obj[key] === undefined) {
        return result;
      }

      if (obj[key] !== null && typeof obj[key] === "object") {
        const value = cb(key, obj[key]);

        if (value !== undefined) {
          result[key] = normalize(obj[key], cb);
        }

        return result;
      }

      if (/^_/.test(key) && !obj[key]) {
        return result;
      }

      result[key] = toStringIfBoolean(obj[key]);

      return result;
    }, {});
}

const transpile = (classes, values) => {
  if (typeof classes === "string") {
    const props = Object.keys(values);
    classes = props.reduce((val, prop) => {
      return val.replace(new RegExp(`%${prop}`, "g"), values[prop]);
    }, classes);
  }
  return classes;
}

const partialPrefixed = (key, val, options) => {
  if (options.partial) {
    if (key in options) {
      return `${options.partial}:${val}`;
    }

    return undefined;
  }

  return val;
}

const themeOption = (themeKey, option, variants) => {
  const { style } = variants;
  const themes = ['dark', 'light'];

  // Select theme from style variant if configured
  if (isObject(variants[themeKey][style])) {
    return themes.map(
      theme => variants[themeKey][style][theme]
    );
  }

  // Select theme from option
  if (variants[themeKey][option]) {
    if (isObject(variants[themeKey][option])) {
      return themes.map(
        theme => variants[themeKey][option][theme]
      );
    }

    return variants[themeKey][option];
  }

  // Default behavior, return both themes
  return themes.map(
    theme => variants[themeKey][theme]
  );
}

const clb =
  (schema = {}) =>
  (options = {}) => {
    const {
      defaults = {},
      base,
      defaultVariants = {},
      variants = {},
      compoundVariants = [],
    } = schema;

    const currentOptions = normalize({
      ...defaultVariants,
      ...defaults,
      ...options,
    });

    const normalized = normalize(variants,  (key, value) => {
      if (!options.partial) {
        return value;
      }

      if (key in options) {
        return value;
      }

      return undefined;
    });

    const variantNames = Object.keys(normalized);

    const sets = [];

    if (!options.partial) {
      sets.push(base);
    }

    variantNames.forEach((variantName) => {
      const option = currentOptions[variantName];
      const variant = normalized[variantName];

      if (variantName === "theme") {
        sets.push(themeOption(variantName, option, normalized));
      } else {
        sets.push(partialPrefixed(
          variantName,
          variant[option],
          options
        ));
      }
    });

    const compounds = compoundVariants.reduce(
      (list, { classes, ...compoundVariantOptions }) => {
        if (isSimpleSubset(compoundVariantOptions, currentOptions)) {
          list.push(classes);
        }
        return list;
      },
      []
    );

    if (compounds.length) {
      sets.push(compounds);
    }

    return clsx(sets.reduce((results, line) => {
      if (!line) {
        return results;
      }

      if (Array.isArray(line)) {
        line
          .filter(ln => !!ln && typeof ln === "string")
          .forEach(ln => results.push(transpile(ln, currentOptions)));

        return results;
      }

      results.push(transpile(line, currentOptions));

      return results;
    }, []));
  };

module.exports = clb;
