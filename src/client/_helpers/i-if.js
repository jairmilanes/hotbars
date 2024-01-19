/**
 * Helper usado para acessar dados em qualquer context
 * sem precisar mudar o cominho do context  com '../',
 * o que causa errors quando formatando os arquivos com
 * com prettier.
 *
 * Uso:
 * ```
 * {{data "user.username"}}
 * {{data "user.list.2.username"}}
 * ```
 *
 * @param {boolean} condition
 * @param {*} truthy
 * @param {*} falsey
 * @param {object} options
 * @returns {(string|number|null|undefined)}
 */
module.exports.iIf = function (condition, truthy, falsey, options) {
  if (condition) return truthy;
  return falsey;
};

module.exports.switch = function (options) {
  var data = this;
  data.__check_conditions = true;
  return options.fn(this);
};

module.exports.case = function(conditional, options) {
  if(conditional && this.__check_conditions) {
    this.__check_conditions = false;
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}
