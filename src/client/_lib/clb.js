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
      const regex1 = new RegExp(`%${prop}`, "g")
      const regex2 = new RegExp(`%${prop}-\\d{3}`, "g")

      // deal with removing color intensity for colors that have
      // no intensity values in Tailwind, like white and black
      if (["color", "bg", "border"].indexOf(prop) > -1) {
        if (["white", "black"].indexOf(values[prop]) > -1) {
          return val.replace(regex2, values[prop]);
        }
      }
      return val.replace(regex1, values[prop]);
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

const themeOption = (option, style, variants) => {
  const themes = ['dark', 'light'];

  // Select theme from style variant if configured
  if (isObject(variants["theme"][style])) {
    return themes.map(
      theme => variants["theme"][style][theme]
    );
  }

  // Select theme from option
  if (variants["theme"][option]) {
    if (isObject(variants["theme"][option])) {
      return themes.map(
        theme => variants["theme"][option][theme]
      );
    }

    return variants["theme"][option];
  }

  // Default behavior, return both themes
  return themes.map(
    theme => variants["theme"][theme]
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
      ...normalize(options),
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

        sets.push(themeOption(option, currentOptions["style"], normalized));
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
