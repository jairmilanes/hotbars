const handlebars = require("handlebars");

// \[((?!(\.min|!(.*))).*?)\] removes env only markers
// \[(!(?!(\.min)).*?)\] removes all exclusion markers

const envName = (env) => {
  if (env.startsWith("prod")) return "prod";
  if (env.startsWith("dev")) return "dev";
  return env;
};

function render(url, options) {
  const { dev, dashboard } = options.data.root;
  const env = envName(options.data.root.env);

  const minSuffix = /\[(\..*)]/;
  const prodRegex = /\[((?!\..*).*?)]/g;
  const envOnlyRegex = /\[((?!(\..*|!|hot)).*?)]/g;
  const notEnv = `[!${env}]`;
  const isEnv = `[${env}]`;
  const isDev = `[hot]`;
  const notDev = `[!hot]`;
  const isDash = `[dash]`;
  const notDash = `[!dash]`;
  const isDashboard = dashboard !== undefined;
  const isProd = env.startsWith("prod");

  // excludes hotbars only scripts
  if (dev && url.indexOf(notDev) > -1) return "";
  url = url.replace(notDev, "");

  // excludes environment scripts
  if (url.indexOf(notEnv) > -1) return "";
  url = url.replace(notEnv, "");

  // excludes dashboard scripts
  if (isDashboard && url.indexOf(notDash) > -1) return "";

  // remove all exclusion markers
  url = url.replace(/\[(!(?!(\..*)).*?)]/g, "");

  const getMinSuffix = (href) => {
    if (minSuffix.test(href)) {
      return href.match(minSuffix)[0];
    }
    return "";
  };

  const conditionalEnv = (href) => {
    if (href.indexOf(isEnv) > -1 || !envOnlyRegex.test(href)) {
      const minSuffixName = getMinSuffix(href);

      const min = url
        .replace(prodRegex, "")
        .replace(
          minSuffixName,
          isProd ? minSuffixName.replace(/(\[|])/g, "") : ""
        );

      return new handlebars.SafeString(
        `<link rel="stylesheet" href="${min}" />`
      );
    }
    return "";
  };

  const conditionalDash = (href) => {
    if (!isDashboard) {
      // exclude dashboard only scripts
      if (href.indexOf(isDash) < 0) {
        return conditionalEnv(href.replace(isDash, ""));
      }
      return "";
    }
    return conditionalEnv(href.replace(isDash, ""));
  };

  const conditionalDev = (href) => {
    if (!dev) {
      // exclude dashboard only scripts
      if (href.indexOf(isDev) < 0) {
        return conditionalDash(href.replace(isDev, ""));
      }
      return "";
    }
    return conditionalDash(href.replace(isDev, ""));
  };

  return conditionalDev(url);
}

/**
 * @param {string} url
 * @param {object} options
 * @returns {(string|number|null|undefined)}
 */
module.exports.styleTag = render;

module.exports.styles = function (urls, options) {
  if (typeof urls === "string") {
    return new handlebars.SafeString(
      urls
        .split(",")
        .map((url) => url.trim())
        .map((url) => render(url.trim(), options))
        .filter((url) => !!url)
        .join("\n")
    );
  }

  return "";
};
