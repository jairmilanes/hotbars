$(() => {
  // $.subscribe("hb-toast", (e) => $.toast(...e))
  // $.subscribe("hb-dismiss", (e) => $.dismiss(e.id))
  // $.subscribe("data-toggle", (e) => $.toggle(e.id))

  $(document).on("click", (e) => {
    const el = e.target.localName === "button" ? $(e.target) : $(e.target).closest("button")

    if (el.length) {
      if (el.data("dispatch")) {
        $.dispatch(el.attr("data-dispatch"), { _el: el, ...(el.data() || {}) })
      }

      if (el.data("dismiss")) {
        $.dismiss(el.data("id"))
      }

      if (el.data("toggle")) {
        $.toggle(el.attr("data-toggle"))
      }

      if (el.data("swap")) {
        const target = $(`#${el.attr("data-swap")}`)
        const swapEl = $(`#${el.attr("data-swap-target")}`)
        const swapDuration = el.attr("data-swap-duration") ? parseInt(el.attr("data-swap-duration"), 10) : undefined;

        const source = (swapEl.length === 0 ? el : swapEl)

        $.swap(source, target, swapDuration)
      }

      if (el.data("toggleable")) {

      }
    }
  })
})