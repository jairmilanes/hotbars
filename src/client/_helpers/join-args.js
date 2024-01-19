/**
 * Helper that joins as many arguments passed as an array.
 *
 * The last argument must be the separator.
 *
 * Uso:
 * ```
 * {{joinArgs "string" "string 2" "string 3" "string 4" ","}}
 * ```
 *
 * @param {array} args
 * @returns {(string|number|null|undefined)}
 */
module.exports.joinArgs = function (...args) {
  console.log("ARGS", args)
  const options = args.pop();
  const separator = args.pop();

  return args.join(separator);
};
