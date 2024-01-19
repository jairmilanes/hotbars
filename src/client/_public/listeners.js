$(() => {
  $.subscribe("hb-toast", (e) => $.toast(...e))
  $.subscribe("hb-dismiss", (e) => $.dismiss(e.id))
  $.subscribe("hb-toggle", (e) => $.toggle(e.id))

  $("[data-dispatch]").on("click", (e) => {
    const el = $(e.currentTarget)
    const attr = e.currentTarget.attributes
    const data = {}

    for (let i = 0; i < attr.length; i++) {
      const it = attr.item(i)
      const keyword = "data-dispatch-"

      if (it.name.startsWith(keyword)) {
        data[it.name.replace(keyword, "")] = it.value
      }
    }

    $.dispatch(el.attr("data-dispatch"), { _el: el, ...data })
  })
})