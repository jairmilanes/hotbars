const dayJs = require("dayjs")

/**
 * Create a variable in the context for later use
 *
 */
module.exports = function (date, format) {
  return dayJs(date).format(format)
};