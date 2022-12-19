const requireFresh = require("../_lib/require-fresh")(require);
const components = requireFresh("../_lib/tailwind");

const tailwind = module.exports;

tailwind._position = function (position) {
  const ps = "absolute";
  switch (position) {
    case "top-left":
      return ps.concat("top-0 left-0");
    case "top-right":
      return ps.concat("top-0 right-0");
    case "bottom-left":
      return ps.concat("bottom-0 right-0");
    case "bottom-right":
      return ps.concat("bottom-0 right-0");
    case "center":
      return ps.concat("top-0 left-0 bottom-0 right-0 m-auto");
    default:
      return "";
  }
};

tailwind._button = function (options) {
  if (options.hash.color && !options.hash.bg) {
    options.hash.bg = options.hash.color;
  }
  if (options.hash.color && !options.hash.border) {
    options.hash.border = options.hash.color;
  }
  return components._button(options.hash || {});
};

tailwind._label = function (options) {
  return components._label(options.hash || {});
};

tailwind._input = function (options) {
  const props = options.hash || {};

  if (props.style === "underline") {
    props.rounded = false;
  }

  return components._input(props);
};

tailwind._alert = function (options) {
  if (options.hash.color && !options.bg) {
    options.hash.bg = options.hash.color;
  }

  const colors = {
    info: "blue",
    error: "red",
    warning: "yellow",
    success: "grren",
  };

  if (colors[options.hash.color]) {
    options.hash.color = colors[options.hash.color];
  }

  if (!options.hash.color) {
    options.hash.color = "gray";
    options.hash.theme = "opaque";
  }

  return components._alert._body(options.hash || {});
};

tailwind._alertText = function (options) {
  return components._alert._text(options.hash || {});
};

tailwind._alertTitle = function (options) {
  return components._alert._title(options.hash || {});
};

tailwind._alertIcon = function (options) {
  if (options.hash.color && !options.bg) {
    options.hash.bg = options.hash.color;
  }
  return components._alert._icon(options.hash || {});
};

tailwind._alertClose = function (options) {
  if (options.hash.color && !options.bg) {
    options.hash.bg = options.hash.color;
  }
  return components._alert._close(options.hash || {});
};
