const clb = require("../../_lib/clb");

module.exports = clb({
  defaults: {
    color: "primary",
    border: "primary",
    bg: "primary",
  },
  base: "focus:ring-4 focus:outline-none disabled:opacity-50",
  defaultVariants: {
    style: "solid",
    size: "md",
    theme: "solid",
  },
  variants: {
    style: {
      solid: "border-2",
      outline: "border-2",
      icon: "border-2",
    },
    theme: {
      solid: {
        dark: "text-white dark:bg-%bg-700 dark:border-%border-700 dark:hover:bg-%bg-600 dark:hover:border-%border-500 dark:focus:bg-%bg-700 dark:focus:border-%border-600 dark:focus:ring-%border-900",
        light:
          "text-white bg-%bg-700 border-%border-700 hover:bg-%bg-600 hover:border-%border-500 focus:bg-%bg-700 focus:border-%border-600 focus:ring-%border-300",
      },
      outline: {
        dark: "dark:text-%color-600 dark:hover:text-%color-400 dark:border-%border-600 dark:hover:border-%border-400 dark:focus:border-%border-600 dark:focus:ring-%border-900",
        light:
          "text-%color-700 hover:text-%color-600 border-%border-700 hover:border-%border-600 focus:ring-%border-300",
      },
    },
    width: {
      auto: "w-auto",
      full: "w-full block",
    },
    rounded: {
      md: "rounded-lg",
      full: "rounded-full",
    },
    disabled: {
      true: "cursor-not-allowed",
    },
    size: {
      sm: "px-4 py-1 text-sm font-medium",
      md: "px-6 py-1.5 text-md font-medium",
      lg: "px-8 py-2 text-lg font-medium",
      iconSm: "p-1 text-sm",
      icon: "p-2.5 text-md",
      iconLg: "p-4 text-lg",
    },
  },
});
