$.fn.mask = function(el, options) {
  if (window.IMask instanceof IMask) {
    return IMask(el, options)
  }
}

$(() => {
  $(`[data-mask]`).each((i, el) => {
    const mask = $(el).data("mask")
    const type = $(el).data("input-type")

    let inst;

    if (type === "currency") {
      inst = IMask(el, {
        mask: Number,  // enable number mask
        // other options are optional with defaults below
        scale: 2,  // digits after point, 0 for integers
        thousandsSeparator: '',  // any single char
        padFractionalZeros: true,  // if true, then pads zeros at end to the length of scale
        normalizeZeros: true,  // appends or removes zeros at ends
        radix: '.',  // fractional delimiter
        mapToRadix: ['.'],  // symbols to process as radix
        // additional number interval options (e.g.)
        // min: -10000,
        // max: 10000,
        autofix: true,
        lazy: false
      });
    } else if (type === "cpf-cnpj") {
      inst = IMask(el, {
        mask: [
          { mask: "00.000.000-00" },
          { mask: "00.000.000/0000-00" },
        ],
        lazy: false,
      });
    } else if (type === "credit-card") {
    inst = IMask(el, {
      mask: "0000-0000-0000-000[0]",
      lazy: false,
    });
  } else {
      inst = IMask(el, {
        mask: mask,
        lazy: false,
      });
    }

    /* $(el).on("change", (e) => {
      console.log("Phone changed", e.target.value, /^\(\d{2}\)\s\d{3,4}-\d{4}$/.test(e.target.value), inst)
    }) */
  })
})
