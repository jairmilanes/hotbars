const clb = require("../../_lib/clb");

module.exports._body = clb({
  /* This can be anything `classnames` accepts. */
  defaults: {
    color: "gray",
    bg: "gray",
  },
  base: "flex p-4",
  defaultVariants: {
    style: "default",
    spacing: "md",
  },
  variants: {
    style: {
      default: "",
      rounded: "rounded-lg",
      bordered: "border-t-4",
    },
    theme: {
      dark: "dark:text-%color-900 dark:bg-%bg-200 dark:border-%bg-500",
      light: "text-%color-800 bg-%bg-200 border-%bg-500",
      opaque: "text-%color-200 bg-%bg-800 border-%bg-800",
    },
    spacing: {
      sm: "mb-2",
      md: "mb-5",
      lg: "mb-9",
    },
  },
});

module.exports._text = clb({
  defaults: {},
  base: "",
  defaultVariants: {
    size: "md",
  },
  size: {
    sm: "text-sm font-medium",
    md: "text-md font-medium",
    lg: "text-lg font-medium",
  },
  icon: {
    true: "ml-3",
  },
});

module.exports._title = clb({
  defaults: {},
  base: "block",
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      sm: "text-md font-medium",
      md: "text-lg font-medium",
      lg: "text-xl font-medium",
    },
  },
});

module.exports._close = clb({
  defaults: {
    color: "gray",
    bg: "gray",
  },
  /* This can be anything `classnames` accepts. */
  base: "ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8",
  defaultVariants: {
    theme: "light",
  },
  variants: {
    theme: {
      dark: "bg-%bg-800 hover:bg-%bg-700",
      light: "text-%color-500 bg-%bg-200 hover:bg-%bg-100",
    },
  },
});

module.exports._icon = clb({
  defaults: {
    color: "gray",
  },
  base: "flex-shrink-0 w-5 h-5",
  defaultVariants: {},
  variants: {
    theme: {
      dark: "dark:text-%color-800",
      light: "text-%color-700",
    },
  },
});
