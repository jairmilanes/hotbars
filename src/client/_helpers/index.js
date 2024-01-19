const tailwind = require("./tailwind");
const vvar = require("./var");
const toString = require("./toString");
const joinArgs = require("./join-args");
const data = require("./data");
const { iIf, switch: sSwitch, case: sCase } = require("./i-if");
const attr = require("./attr");
const color = require("./_color");

module.exports = { tailwind, _color: color, attr, var: vvar, toStr: toString, joinArgs, _get: data, iIf, switch: sSwitch, case: sCase };
