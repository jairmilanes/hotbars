const clsx = require("clsx");
const isBoolean = (maybeBoolean) => typeof maybeBoolean === "boolean";
const toStringIfBoolean = (value) => (isBoolean(value) ? String(value) : value);
const isSimpleSubset = (a, b) =>
  Object.entries(a).every(([key, value]) => b[key] === value);

/**
 * Removes undefined values recursively.
 */
const normalize = (obj, values) => {
  return JSON.parse(
    JSON.stringify(obj, function (key, value) {
      if (!/^_/.test(key) && value === undefined) {
        return null;
      }

      if (values && typeof value === "string") {
        const props = Object.keys(values);
        value = props.reduce((val, prop) => {
          return val.replace(new RegExp(`%${prop}`, "g"), values[prop]);
        }, value);
      }

      return /^_/.test(key) && !value ? void 0 : value;
    }).replace(/null/g, '"undefined"')
  );
};

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
      ...defaults,
      ...defaultVariants,
      ...options,
    });

    const normalized = normalize(variants, currentOptions);

    const keys = Object.keys(normalized);

    return clsx([
      base,
      keys.map((variantName) => {
        const choice = toStringIfBoolean(currentOptions[variantName]);

        if (variantName === "theme") {
          const { style } = currentOptions;

          if (
            normalized["theme"][style] &&
            typeof normalized["theme"][style] !== "string"
          ) {
            return [
              normalized["theme"][style]["dark"],
              normalized["theme"][style]["light"],
            ];
          }

          if (normalized["theme"][choice]) {
            if (typeof normalized["theme"][choice] !== "string") {
              return [
                normalized["theme"][choice]["dark"],
                normalized["theme"][choice]["light"],
              ];
            }
            return normalized["theme"][choice];
          }

          return [normalized["theme"]["dark"], normalized["theme"]["light"]];
        }

        return normalized[variantName][choice];
      }),
      compoundVariants.reduce(
        (list, { classes, ...compoundVariantOptions }) => {
          if (isSimpleSubset(compoundVariantOptions, currentOptions)) {
            list.push(classes);
          }
          return list;
        },
        []
      ),
    ]);
  };

module.exports = clb;
