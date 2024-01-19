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
    theme: "default",
    layout: "column",
    hover: null,
    rounded: "lg",
    bordered: true,
    block: false,
    shadow: "md",
    size: "auto",
    padding: "md",
    gap: "",
    spacing: 0
  },
  variants: {
    theme: {
      default: "text-body-dark bg-base-light border-body-light dark:text-body-light dark:bg-base-dark dark:border-body-dark",
      custom: "text-%color-700 bg-%bg-100 border-%border-200 dark:text-%color-200 dark:bg-%bg-800 dark:border-%border-700",
      primary: "text-%color-700 bg-primary-100 border-primary-200 dark:text-%color-200 dark:bg-primary-800 dark:border-primary-700",
      info: "text-%color-700 bg-info-100 border-info-200 dark:text-%color-200 dark:bg-info-800 dark:border-info-700",
      warn: "text-%color-700 bg-warn-100 border-warn-200 dark:text-%color-200 dark:bg-warn-600 dark:border-warn-700",
      error: "text-%color-700 bg-error-100 border-error-200 dark:text-%color-200 dark:bg-error-800 dark:border-error-700",
      success: "text-%color-700 bg-success-100 border-success-200 dark:text-%color-200 dark:bg-success-800 dark:border-success-700",
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
      true: "border",
      false: ""
    },
    block: {
      true: 'block',
      false: ""
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
      auto: "w-auto",
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
  defaults: {},
  base: "flex w-full",
  defaultVariants: {
    layout: "column",
    height: "auto",
    overflow: "none",
    padding: "md",
    spacing: "md"
  },
  variants: {
    layout: {
      row: "flex",
      column: "flex flex-col",
    },
    height: {
      auto: "max-h-auto",
      full: "max-h-full",
      md: "max-h-[24rem]",
      lg: "max-h-[32rem]"
    },
    overflow: {
      none: "",
      auto: "overflow-auto",
      hidden: "overflow-hidden",
      "y": "overflow-x-hidden overflow-y-auto",
      "X": "overflow-y-hidden overflow-x-auto",
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