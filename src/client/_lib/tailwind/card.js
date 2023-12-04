const clb = require("../../_lib/clb");

module.exports = clb({
  /* This can be anything `classnames` accepts. */
  defaults: {
    color: "gray",
    bg: "gray",
    border: "gray"
  },
  base: "",
  defaultVariants: {
    rounded: "lg",
    bordered: true,
    shadow: "md",
    size: "md",
    padding: 0,
    spacing: 0
  },
  variants: {
    theme: {
      dark: "dark:text-%color-200 dark:bg-%bg-800 dark:border-%border-700",
      light: "text-%color-700 bg-%bg-100 border-%border-200"
    },
    layout: {
      row: "flex",
      column: "flex flex-col",
      grid: "grid grid-cols-12"
    },
    hover: {
      true: "hover:bg-%bg-100 dark:hover:bg-%bg-700"
    },
    rounded: {
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl"
    },
    bordered: {
      true: "border"
    },
    block: {
      true: 'block'
    },
    shadow: {
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
    },
    size: {
      sm: 'w-[24rem]',
      md: 'w-[36rem]',
      lg: 'w-[48rem]',
      full: "w-full",
    },
    padding: {
      0: "p-0",
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    gap: {
      0: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-8",
    },
    spacing: {
      0: "space-y-0",
      sm: "space-y-2",
      md: "space-y-4",
      lg: "space-y-6",
    },
  },
});

module.exports.body = clb({
  /* This can be anything `classnames` accepts. */
  defaults: {
    color: "gray",
    bg: "gray",
    border: "gray"
  },
  base: "flex w-full",
  defaultVariants: {
    padding: "md",
    spacing: "md"
  },
  variants: {
    theme: {
      dark: "",
      light: ""
    },
    layout: {
      row: "flex",
      column: "flex flex-col",
    },
    padding: {
      0: "p-0",
      sm: 'p-4 sm:p-6',
      md: 'p-6 sm:p-8',
      lg: 'p-8 sm:p-10',
    },
    spacing: {
      0: "space-y-0",
      sm: "space-y-2 md:space-y-4",
      md: "space-y-4 md:space-y-6",
      lg: "space-y-6 md:space-y-8",
    },
  },
});