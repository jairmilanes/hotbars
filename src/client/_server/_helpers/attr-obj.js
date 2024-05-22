
module.exports.attr = function (options) {
  return Object.keys(options.hash || {}).reduce((str, key) => {
    const val = String(options.hash[key]).replace(/^['"]|["']$/g, "");

    if (val && val !== "null" && val !== "undefined" && val !==null && val !== undefined) {
      return str.concat(` ${key}="${val}"`);
    }

    return str;
  }, "");
};


module.exports.attrObj = function (obj, options) {
  return Object.keys(obj || {}).reduce((str, key) => {
    const val = String(obj[key]).replace(/^['"]|["']$/g, "");

    if (val && val !== "null" && val !== "undefined" && val !==null && val !== undefined) {
      str = str.concat(` ${key}="${val}"`);
    }

    return str;
  }, "");
};

module.exports.attrData = function (obj, options) {
  return Object.keys(obj || {}).reduce((str, key) => {
    const val = String(obj[key]).replace(/^['"]|["']$/g, "");

    if (val && val !== "null" && val !== "undefined" && val !== null && val !== undefined) {
      return str.concat(` data-${key}="${val}"`);
    }

    return str;
  }, "");
};

