const tailwind = require("./tailwind");
const vvar = require("./var");
const toString = require("./toString");
const joinArgs = require("./join-args");
const data = require("./data");
const { iIf, switch: sSwitch, case: sCase } = require("./i-if");
const color = require("./_color");
const clear = require("./clear");
const value = require("./value");
const concat = require("./concat");
const prop = require("./prop");
const loop = require("./loop");
const bytesToSize = require("./bytes-to-size");
const find = require("./find");
const raw = require("./raw");
const dateFormat = require("./date-format");

const { attr, attrData, attrObj } = require("./attr-obj");

module.exports = { tailwind, raw, find, dateFormat, bytesToSize, concat, loop, attr, attrData, attrObj, prop, value, clear, _color: color, var: vvar, toStr: toString, joinArgs, _get: data, iIf, switch: sSwitch, case: sCase };

