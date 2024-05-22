/**
 * Removes all occurrences of a string with na regex
 *
 * @param {string} regex
 * @param {string} str
 * @param {object} options
 * @returns {(string|number|null|undefined)}
 */
module.exports.regexRemove = function (regex, str, options) {
  return str.replace(new RegExp(`/${regex}/g`), "");
};

module.exports.regexReplace = function (regex, str, value, options) {
  return str.replace(new RegExp(`/${regex}/g`), value || "");
};
