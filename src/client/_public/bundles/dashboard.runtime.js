const defaults = require("./defaults.runtime");
const helpers = require("../../_helpers");

const allHelpers = { ...defaults, ...helpers };
Object.keys(allHelpers)
  .forEach((name) => {
    if (typeof allHelpers[name] === "function") {
      Handlebars.registerHelper(name, allHelpers[name]);
    } else {
      Handlebars.registerHelper(allHelpers[name]);
    }
  });

