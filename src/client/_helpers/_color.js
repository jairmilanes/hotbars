/**
 * Removes extra white spaces
 *
 * @param {object} options
 * @returns {(string)}
 */
module.exports = function (color, intensity, options) {
  if (typeof color !== "string") return ""
  if (color.indexOf("-") > -1 || ["white", "black"].indexOf(color) > -1) {
    return color
  }

  return `${color}-${intensity}`
};

