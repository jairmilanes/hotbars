const array = require(`handlebars-helpers/lib/array`);
const collection = require(`handlebars-helpers/lib/collection`);
const comparison = require(`handlebars-helpers/lib/comparison`);
const html = require(`handlebars-helpers/lib/html`);
const inflection = require(`handlebars-helpers/lib/inflection`);
const math = require(`handlebars-helpers/lib/math`);
const number = require(`handlebars-helpers/lib/number`);
const object = require(`handlebars-helpers/lib/object`);
const regex = require(`handlebars-helpers/lib/regex`);
const string = require(`handlebars-helpers/lib/string`);
const url = require(`handlebars-helpers/lib/url`);
const i18n = require("../../_helpers/i18n");
const layouts = require("handlebars-layouts")(Handlebars);
const helpers = require("../../_helpers");

module.exports = {
  layouts,
  array,
  collection,
  comparison,
  html,
  i18n,
  inflection,
  math,
  number,
  object,
  regex,
  string,
  url,
  ...helpers
};
