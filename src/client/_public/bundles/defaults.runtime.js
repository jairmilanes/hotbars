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
const i18n = require("../../../server/helpers/i18n");

const helpers = [
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
];

const layouts = require("handlebars-layouts");

Handlebars.registerHelper(layouts(Handlebars));

helpers.forEach((helper) => {
  Object.keys(helper).forEach((name) => {
    Handlebars.registerHelper(name, helper[name]);
  });
});
