const defaults = require("./defaults.runtime");
const helpers = require("../../_helpers");

Object.keys({ ...defaults, ...helpers }).forEach((name) => {
  Handlebars.registerHelper(name, helpers[name]);
});
