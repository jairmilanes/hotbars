const clb = require("../../_lib/clb");

module.exports = clb({
  defaults: {
    bg: "gray",
    color: "gray",
    border: "gray",
    accent: "primary",
  },
  base: "block w-full",
  defaultVariants: {
    type: "input",
    style: "default",
    size: "md",
    rounded: true
  },
  variants: {
    type: {
      input: "",
      textarea: "",
      select: "peer",
      checkbox: "",
      radio: "",
      toggle: "",
      email: "",
      password: ""
    },
    style: {
      default: "border-2 focus:ring-2 focus:ring-offset-2 text-%color-900 bg-%bg-50 border-%border-300 placeholder-%bg-400 focus:border-%border-300 focus:ring-offset-%border-300 focus:ring-%accent-600 dark:text-%color-200 focus:text-%color-200 dark:bg-%bg-700 dark:border-%border-600 dark:placeholder-%bg-500 dark:focus:border-%border-900 dark:focus:ring-offset-%border-900 dark:focus:ring-%accent-600",
      underline: "px-0 border-0 border-b-2 bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 text-%color-700 border-%border-200 appearance-none focus:border-%accent-600 placeholder-%bg-400 dark:text-%color-200 dark:border-%border-700 dark:focus:border-%accent-600 dark:placeholder-%bg-500",
      checkbox: "w-4 h-4 border-2 rounded focus:ring-2 text-%accent-600 bg-%bg-100 border-%border-300 focus:ring-%accent-500 dark:text-%accent-500 dark:bg-%bg-700 dark:border-%border-600 dark:ring-offset-%border-800 dark:focus:border-%border-900 dark:focus:ring-%accent-600",
      radio: "w-4 h-4 border rounded-full focus:ring-2 text-%accent-600 bg-%bg-100 border-%border-300 focus:ring-%border-500 dark:text-%accent-500 dark:bg-%bg-700 dark:border-%border-600 dark:ring-offset-%border-800 dark:focus:ring-%accent-600",
    },
    invalid: "invalid:bg-red-100 invalid:border-red-500 focus:invalid:border-red-500 focus:invalid:ring-pink-500 invalid:dark:bg-red-900 invalid:dark:border-red-500 focus:invalid:dark:border-red-500",
    rounded: {
      true: "rounded-lg",
    },
    size: {
      sm: "p-2 text-sm",
      md: "p-2.5 text-md",
      lg: "px-4 py-3 text-lg",
    },
  },
});
