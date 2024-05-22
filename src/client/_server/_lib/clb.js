const clsx = require("clsx");
const { isString, isObject, isBoolean } = require("lodash");

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
      const lightRegex = new RegExp(`\\s(${prop}-%${prop}-\\d{3})`, "g")
      const darkRegex = new RegExp(`dark:${prop}-%${prop}-\\d{3}`, "g")

      // deal with removing color intensity for colors that have
      // no intensity values in Tailwind, like white and blackWW
      if (["color", "bg", "border"].indexOf(prop) > -1) {
        if (isString(values[prop])) {
          if (["white", "black"].indexOf(values[prop]) > -1) {
            return val.replace(regex2, values[prop]);
          } else {
            return val.replace(regex1, values[prop]);
          }
        }

        if (isObject(values[prop])) {
          const { dark, light } = values[prop]

          if (isString(dark)) {
            if (["white", "black"].indexOf(dark) > -1) {
              val = val.replace(regex2, dark);
            } else {
              val = val.replace(regex1, dark);
            }
          }

          if (isString(light)) {
            if (["white", "black"].indexOf(light) > -1) {
              val = val.replace(regex2, light);
            } else {
              val = val.replace(regex1, light);
            }
          }

          if (isObject(light)) {
            const { value, intensity } = light

            if (value) {
              if (["white", "black"].indexOf(value) > -1) {
                val = val.replace(regex2, value);
              } else {
                val = val.replace(lightRegex, ` ${prop}-${value}-${intensity}`);
              }
            }
          }

          if (isObject(dark)) {
            const { value, intensity } = dark

            if (value) {
              if (["white", "black"].indexOf(value) > -1) {
                val = val.replace(regex2, value);
              } else {
                val = val.replace(darkRegex, `dark:${prop}-${value}-${intensity}`);
              }
            }
          }
        }

        return val
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
