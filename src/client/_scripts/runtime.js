const helpers = [
  require(`handlebars-helpers/lib/array`),
  require(`handlebars-helpers/lib/collection`),
  require(`handlebars-helpers/lib/comparison`),
  require(`handlebars-helpers/lib/date`),
  require(`handlebars-helpers/lib/html`),
  require(`handlebars-helpers/lib/i18n`),
  require(`handlebars-helpers/lib/inflection`),
  require(`handlebars-helpers/lib/math`),
  require(`handlebars-helpers/lib/number`),
  require(`handlebars-helpers/lib/object`),
  require(`handlebars-helpers/lib/regex`),
  require(`handlebars-helpers/lib/string`),
  require(`handlebars-helpers/lib/url`),
];

helpers.forEach((helper) => {
  Object.keys(helper).forEach((name) => {
    Handlebars.registerHelper(name, helper[name]);
  });
});

Handlebars.registerHelper(require("handlebars-layouts"));
