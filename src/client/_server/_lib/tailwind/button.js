const clb = require("../../_lib/clb");

module.exports = clb({
  defaults: {
    color: "primary",
    border: "primary",
    bg: "primary",
  },
  base: "",
  defaultVariants: {
    style: "solid",
    size: "md",
    width: "auto",
    rounded: "md"
  },
  variants: {
    style: {
      solid: "inline-flex items-center justify-center border-%color-600 border-2 focus:ring-4 focus:outline-none disabled:opacity-50 focus:disabled:opacity-50 text-body-light bg-%bg-700 border-%border-700 hover:bg-%bg-600 hover:border-%border-500 focus:bg-%bg-700 focus:border-%border-600 focus:ring-%border-300 dark:bg-%bg-700 dark:border-%border-700 dark:hover:bg-%bg-600 dark:hover:border-%border-500 dark:focus:bg-%bg-700 dark:focus:border-%border-600 dark:focus:ring-%border-900",
      outline: "inline-flex items-center justify-center border-2 focus:ring-4 focus:outline-none disabled:opacity-50 focus:disabled:opacity-50 text-%color-600 hover:text-%color-700 border-%border-400 hover:border-%border-500 focus:ring-%border-300 dark:text-%color-300 dark:hover:text-%color-200 dark:border-%border-500 dark:hover:border-%border-400 dark:focus:border-%border-600 dark:focus:ring-%border-900",
      link: "inline-flex border-0 outline-o focus:ring-0 text-%color-700 hover:text-%color-500 dark:text-%color-600 dark:hover:text-%color-400",
      icon: "inline-flex items-center justify-center border-2",
    },
    width: {
      auto: "",
      full: "w-full block",
    },
    rounded: {
      none: "rounded-none",
      md: "rounded-lg",
      full: "rounded-full",
    },
    disabled: {
      true: "cursor-not-allowed",
    },
    size: {
      sm: "px-2 py-1 text-sm font-medium",
      md: "px-4 py-1.5 text-md font-medium",
      lg: "px-6 py-2.5 text-md font-medium",
      iconSm: "w-9 h-9 text-sm font-medium items-center justify-center",
      icon: "w-10 h-10 text-md font-medium items-center justify-center",
      iconLg: "w-11 h-11 text-lg font-medium items-center justify-center",
      iconXl: "w-12 h-12 text-xl font-medium items-center justify-center",
      icon2xl: "w-13 h-13 text-2xl font-medium items-center justify-center",
      icon3xl: "w-14 h-14 text-3xl font-medium items-center justify-center",
      icon4xl: "w-15 h-15 text-4xl font-medium items-center justify-center",
      link: "p-0 m-0 text-center",
    },
  },
});

module.exports.icon = clb({
  defaults: {},
  variants: {
    size: {
      sm: "text-base",
      md: "text-lg",
      lg: "text-xl",
      xl: "text-2xl",
      "2xl": "text-3xl",
      "3xl": "text-4xl",
      "4xl": "text-5xl",
      "5xl": "text-6xl",
      "6xl": "text-7xl",
      "7xl": "text-8xl",
    }
  }
})