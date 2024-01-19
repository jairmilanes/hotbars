const Prism = require('prismjs');
// const Handlebars = require("handlebars")
const escape = require("escape-html")
const loadLanguages = require('prismjs/components/');

loadLanguages(['handlebars']);
/**
 * Removes extra white spaces
 * @param {string} str
 * @param {object} options
 * @returns {(string)}
 */
module.exports._raw = function (options) {
  return options.fn()
};

function fixIndenting(code) {
  const openTags = []
  const indent = 4

  const add = (str, count) => {
    for (let i = 1; i <= count; i++) {
      str = ` ${str}`
    }
    return str
  }

  return code
    .split("\r\n")
    .map(i => i.trim())
    .filter(i => i.length > 0)
    .map(i => {
      let trimmed = i
      // console.log("openTags 1", openTags, trimmed)
      if (trimmed.startsWith("{{#")) {
        const keyword = i.split(" ").shift().replace("{{#", "").replace("}}", "").trim()
        // console.log("--- indenting 1", openTags.length > 0 ? (openTags.length * indent) : 0)
        trimmed = add(trimmed, openTags.length > 0 ? (openTags.length * indent) : 0)
        openTags.push(keyword)
      }
      else if (trimmed.startsWith("{{{")) {
        // console.log("--- indenting 2", openTags.length > 0 ? (openTags.length * indent) : 0)
        trimmed = add(trimmed, openTags.length > 0 ? (openTags.length * indent) + indent : 0)
      }
      else if (trimmed === "}}}") {
        // console.log("--- indenting 3", (openTags.length * indent) - indent)
        trimmed = add(trimmed, (openTags.length * indent) - indent)
      }

      else if (!trimmed.startsWith("{") && !trimmed.startsWith("<")) {
        // console.log("--- indenting 4", openTags.length > 0 ? (openTags.length * indent) : 0, trimmed)
        trimmed = add(trimmed, (openTags.length || 1) * indent)
      }

      else if (!trimmed.startsWith("{") && trimmed.startsWith("<")) {
        // console.log("--- indenting 5", openTags.length > 0 ? (openTags.length * indent) : 0, trimmed)
        trimmed = add(escape(trimmed), openTags.length > 0 ? (openTags.length * indent) : 0)
      }

      else if (trimmed.startsWith("{{/")) {
        const keyword = trimmed.split(" ").shift().replace("{{/", "").replace("}}", "").trim()
        if (openTags[openTags.length - 1] === keyword) {
          openTags.pop()
          // console.log("--- indenting 6", openTags.length * indent)
          trimmed = add(trimmed, (openTags.length * indent))
        }
      }
      // console.log("openTags 2", openTags)
      return trimmed
    }).join("\r\n")
}

module.exports.raw = function (options) {
  const code = options.fn(this)
  const indented = fixIndenting(code)

  // console.log(indented)
  return `{{{{_raw}}}}\r\n${indented}{{{{/_raw}}}}`
};