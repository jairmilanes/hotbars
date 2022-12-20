const clb = require("../../_lib/clb");

module.exports = clb({
  /* This can be anything `classnames` accepts. */
  defaults: {
    color: "gray",
    bg: "gray",
    border: "gray",
    justify: "center",
    align: "itmes-stretch"
  },
  base: "",
  defaultVariants: {
    style: "grid",
    theme: "none",
    border: true,
    shadow: "md",
    size: "md",
    padding: "md",
    spacing: "md"
  },
  variants: {
    style: {
      flexRow: "flex",
      flexcolumn: "flex flex-col",
      grid: "grid grid-cols-12"
    },
    theme: {
      none: "",
      dark: "dark:text-%color-200 dark:bg-%bg-800 dark:border-%border-700 dark:hover:bg-%bg-700",
      light: "text-%color-700 bg-%bg-100 border-%border-200 hover:bg-%bg-100"
    },
    justify: "!justify-%justify",
    align: "%align",
    place: "!place-%align",
    size: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      full: "w-full",
    },
    padding: {
      0: "p-0",
      sm: 'p-4 sm:p-6',
      md: 'p-6 sm:p-8',
      lg: 'p-8 sm:p-10',
    },
    gap: {
      0: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-8",
    },
    spacing: {
      0: "space-y-0",
      sm: "space-y-2 md:space-y-4",
      md: "space-y-4 md:space-y-6",
      lg: "space-y-6 md:space-y-8",
    },
  },
});