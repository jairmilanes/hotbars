const isNill = (value) => value === null || value === undefined;
const isObject = (value) => typeof value === "object" && !isNill(value)
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
module.exports = function (fieldName, formName, options) {
  if (isObject(fieldName)) {
    return
  }

  if (isObject(formName)) {
    options = formName
  }

  if (typeof formName === "string") {
    if (!isNill(options.data.root[formName][fieldName])) {
      return options.data.root[formName][fieldName]
    }

    if (!isNill(options.data.root?.forms[formName])) {
      return options.data.root?.forms[formName][fieldName]
    }
  }

  if (isObject(options.data.local) && !isNill(options.data.local?.value)) {
    return options.data.local?.value
  }

  if (isObject(options.data.local?._locals) && !isNill(options.data.local?._locals?.value)) {
    return options.data.local?._locals?.value
  }

  if (isObject(options.data.root?.form) && !isNill(options.data.root?.form[fieldName])) {
    return options.data.root?.form[fieldName]
  }

  if (isObject(options.data.root?.values) && !isNill(options.data.root?.values[fieldName])) {
    return options.data.root?.values[fieldName]
  }

  return undefined;
};

