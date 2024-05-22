const { createFrame } = require("handlebars")
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
 * @param {number} target
 * @returns {(string|number|null|undefined)}
 */
module.exports = function (target, options) {
  let i = 0;
  let buffer = ""
  const data = createFrame(options, options.hash)
  while(i < target) {
    buffer += options.fn({ index: i }, { data })
    ++i
  }
  return buffer
};

