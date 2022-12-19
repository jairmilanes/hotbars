module.exports = function (options) {
  return Object.keys(options.hash || {}).reduce((str, key) => {
    const val = String(options.hash[key]).replace(/^['"]|["']$/g, "");

    if (val && val !== "null" && val !== "undefined") {
      return str.concat(` ${key}="${val}"`);
    }

    return str;
  }, "");
};
