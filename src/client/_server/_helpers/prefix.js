/**
 * Prefixes a class name with a configrued prefix
 *
 * Usage:
 * ```
 * {{class "my-class"}}
 * ```
 *
 * @param {string} className
 * @param {object} options
 * @returns {(string)}
 */
module.exports._prefix = function (className, options) {
  return ["hbs", className].join("-");
};
