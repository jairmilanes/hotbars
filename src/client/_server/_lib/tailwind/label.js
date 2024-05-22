const clb = require("../clb");

module.exports = clb({
  defaults: {
    color: "gray",
  },
  base: "text-sm font-medium",
  defaultVariants: {},
  variants: {
    theme: {
      dark: "dark:text-%color-400",
      light: "text-%color-700",
    },
    block: {
      true: "block",
    },
    spacing: {
      left: "ml-2",
      bottom: "mb-2",
      bottomLeft: "ml-2 mb-2",
      none: ""
    },
  },
});
