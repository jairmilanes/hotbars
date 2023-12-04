const allHelpers = require("./defaults.runtime");

Object.keys(allHelpers)
  .forEach((name) => {
    if (typeof allHelpers[name] === "function") {
      Handlebars.registerHelper(name, allHelpers[name]);
    } else {
      Handlebars.registerHelper(allHelpers[name]);
    }
  });

