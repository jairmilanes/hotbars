/**
 * Returns a Tailwind color format
 *
 * @param {string} color
 * @param {string|number} intensity
 * @param {object} options
 * @returns {(string)}
 */
module.exports = function (color, intensity, options) {
  if (typeof color !== "string") return ""

  if (/^.+-\d{3}$/.test(color)) {
    return color
  }

  if (["white", "black"].indexOf(color) > -1) {
    return color
  }

  return `${color}-${intensity || 500}`
};

