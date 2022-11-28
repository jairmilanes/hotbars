const primary = {
  light: {
    normal: "",
    hover: "",
    focused: "",
  },
  dark: {
    normal: "",
    hover: "",
    focused: "",
  },
};

const buttons = {
  light: {
    color: {
      solids: ["text-white-25", "hover:text-white"],
      outline: ["text-%s-700", "hover:text-%s-500"],
      text: ["text-%s-600"],
      action: ["text-%s-700", "hove:text-%s-500"],
    },
  },
  dark: {
    color: {
      solids: ["text-white-25", "hover:text-white"],
      outline: ["text-%s-700", "hover:text-%s-500"],
      text: ["text-white-75"],
      action: ["text-white-75", "hove:text-white"],
    },
  },
};

/**
 * Removes extra white spaces
 *
 * @param {object} options
 * @returns {(string)}
 */
module.exports = function (color, options) {
  const theme = {
    light: {
      btn: {
        default: [
          "bg-gray-800",
          "hover:bg-%s-900",
          "text-white",
          "dark:bg-%s-800",
          "dark:hover:bg-%s-700",
          "dark:border-%s-700",
          "focus:ring-4",
          "focus:outline-none",
          "focus:ring-%s-300",
          "dark:focus:ring-%s-700",
          "focus:ring-4",
          "focus:outline-none",
        ],
        outline: [],
        dark: [],
        light: [],
        icon: [],
      },
    },
    dark: {
      btn: {
        default: [],
        outline: [],
        dark: [],
        light: [],
        icon: [],
      },
    },
  };

  // return options.fn(this).replace(/\s+/g,' ');
  return "";
};
