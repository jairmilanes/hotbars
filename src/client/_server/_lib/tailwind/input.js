const clb = require("../../_lib/clb");

module.exports = clb({
  defaults: {
    bg: "gray",
    color: "gray",
    border: "gray",
    accent: "primary",
  },
  base: "block",
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
      default: "w-full border-2 focus:ring-2 focus:ring-offset-2 text-%color-700 bg-%bg-50 border-%border-300 placeholder-%bg-400 focus:border-%border-300 focus:ring-offset-%border-300 focus:ring-%accent-600 focus:text-%color-900 dark:text-%color-300 dark:bg-%bg-800 dark:border-%border-700 dark:placeholder-%bg-500 dark:focus:border-%border-900 dark:focus:ring-offset-%border-900 dark:focus:ring-%accent-600",
      underline: "w-full px-0 border-0 border-b-2 bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 text-%color-700 border-%border-200 appearance-none focus:border-%accent-600 placeholder-%bg-400 dark:text-%color-200 dark:border-%border-700 dark:focus:border-%accent-600 dark:placeholder-%bg-500",
      checkbox: "w-4 h-4 border-2 rounded focus:ring-2 text-%accent-600 bg-%bg-100 border-%border-300 focus:ring-%accent-500 dark:text-%accent-500 dark:bg-%bg-700 dark:border-%border-600 dark:ring-offset-%border-800 dark:focus:border-%border-900 dark:focus:ring-%accent-600",
      radio: "w-4 h-4 border rounded-full focus:ring-2 text-%accent-600 bg-%bg-100 border-%border-300 focus:ring-%border-500 dark:text-%accent-500 dark:bg-%bg-700 dark:border-%border-600 dark:ring-offset-%border-800 dark:focus:ring-%accent-600",
      toggle: "w-11 h-6 bg-%bg-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-%accent-300 dark:peer-focus:ring-%accent-800 dark:bg-%bg-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-%border after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-%border-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-%border-600 peer-checked:bg-%accent-600"
    },
    disabled: {
      disabled: "cursor-not-allowed disabled:opacity-75 disabled:text-body-lighter dark:disabled:text-body-light"
    },
    invalid: "invalid:bg-red-100 invalid:border-red-500 focus:invalid:border-red-500 focus:invalid:ring-pink-500 invalid:dark:bg-red-900 invalid:dark:border-red-500 focus:invalid:dark:border-red-500",
    rounded: {
      true: "rounded-lg",
    },
    size: {
      xs: "p-1 text-xs",
      sm: "p-1.5 text-sm",
      md: "p-2.5 text-md",
      lg: "px-4 py-3 text-lg",
      checkbox: ""
    },
  },
});
