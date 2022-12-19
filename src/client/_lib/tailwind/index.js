const requireFresh = require("../../_lib/require-fresh")(require);

module.exports = {
  _alert: requireFresh("./alert"),
  _button: requireFresh("./button"),
  _label: requireFresh("./label"),
  _input: requireFresh("./input"),
};
