
/**
 * Helper to facilitate the access to form values
 * by form components.
 *
 * Use:
 * ```
 * {{value "field-name"}}
 * ```
 *
 * @param {string} fieldName
 * @param {?string|object} formName
 * @param {object} options
 * @returns {(string|number|null|undefined)}
 */
module.exports = function (dataKey, options) {
  if (typeof dataKey !== "string") {
    return;
  }

  if (this[dataKey]) {
    delete this[dataKey]
  }

  return;
};

