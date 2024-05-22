
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
module.exports = function (...entries) {
  const options = entries.pop()
  return entries.reduce((ac, str) => ac.concat(str), "")
};

