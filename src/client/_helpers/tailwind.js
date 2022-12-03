const tailwind = module.exports;

tailwind.position = function (position, options) {
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

/**
 * Button styles
 *
 * @param {string} style
 * @param {String} color
 * @param {object} options
 * @returns {(string)}
 */
tailwind.button = function (style, color, options) {
  if (typeof color !== "string") {
    options = color;
    color = undefined;
  }
  const theme = {
    default: [
      "px-5 py-2.5",
      "text-sm font-medium",

      "text-white",
      "bg-%s-800 hover:bg-%s-900",
      "focus:ring-4 focus:ring-%s-300",
      "focus:outline-none",

      "dark:bg-%s-800 dark:hover:bg-%s-700",
      "dark:border-%s-700",
      "dark:focus:ring-%s-700",

      "rounded-lg",
    ],
    outline: [
      "px-5 py-2.5",
      "text-sm font-medium",

      "text-%s-700 hover:text-%s-500",
      "border border-%s-700 hover:border-%s-600",
      "focus:ring-4 focus:ring-%s-300",
      "focus:outline-none",

      "dark:text-%s-500",
      "dark:border-%s-500",
      "dark:focus:ring-%s-800",

      "rounded-lg",
    ],
    dark: [
      "px-5 py-2.5",
      "text-sm font-medium",

      "text-white",
      "bg-gray-800 hover:bg-gray-900",
      "focus:ring-4 focus:ring-gray-300",
      "focus:outline-none",

      "dark:bg-gray-800 dark:hover:bg-gray-700",
      "dark:border-gray-700",
      "dark:focus:ring-gray-700",

      "rounded-lg",
    ],
    light: [
      "px-5 py-2.5",
      "text-sm font-medium",

      "text-gray-900",
      "bg-white hover:bg-gray-100",
      "border border-gray-300",
      "focus:ring-4 focus:ring-gray-200",
      "focus:outline-none",

      "dark:text-white",
      "dark:bg-gray-800 dark:hover:bg-gray-700",
      "dark:border-gray-600 dark:hover:border-gray-600",
      "dark:focus:ring-gray-700",
    ],
    icon: [
      "p-2",

      "text-sm font-medium",

      "text-white",
      "bg-%s-800 hover:bg-%s-900",
      "focus:ring-4 focus:ring-%s-300",
      "focus:outline-none",

      "dark:bg-%s-800 dark:hover:bg-%s-700",
      "dark:border-%s-700",
      "dark:focus:ring-%s-700",

      "rounded-full",
    ],
    iconOutline: [
      "p-2",

      "text-%s-700 hover:text-%s-500",
      "border border-%s-700 hover:border-%s-600",
      "focus:ring-4 focus:ring-%s-300",
      "focus:outline-none",

      "dark:text-%s-500",
      "dark:border-%s-500",
      "dark:focus:ring-%s-800",

      "rounded-full",
    ],
  };

  return (theme[style] || theme.default)
    .map((st) => st.replace(/%s/g, color || "blue"))
    .join(" ")
    .trim();
};
