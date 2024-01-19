function keys(obj) {
  return Object.keys(obj)
}

const defaults = selector => ({
  selector,
  target: $(`#${selector.attr("hb-toggle-slide")}`),
  direction: selector.attr("hb-slide-direction") || "top",
  start: selector.attr("hb-slide-start") || "4rem",
  end: selector.attr("hb-slide-end") || "2rem",
  duration: selector.attr("hb-slide-duration") || "300"
})

const selectorStates = () => {
  switch(name) {
    case "active":
      return ``
    case "default":
      return ``
    default:
      return ["active", "default"];
  }
}

const states = (el) => {
  return (name) => {
    const { target, direction, start, end, duration } = defaults(el)

    switch(name) {
      case "init":
        target.removeClass(`opacity-100 ${direction}-100`)
        return `${direction}-[${start}] opacity-0 transition-all duration-${duration} z-[1] focus:ring-0 focus:outline-none`
      case "hidden":
        return `hidden z-[-1] ${direction}-[${end}] opacity-0`
      case "closed":
        return `z-[-1] ${direction}-[${end}] opacity-0`
      case "prepare":
        return `z-[999] ${direction}-[${end}] opacity-0`
      case "open":
        return `z-[999] ${direction}-[${start}] opacity-100`
      default:
        return ["init", "hidden", "closed", "prepare", "open"];
    }
  }
}

const close = ({ target, duration  }) => {
  target.setState("closed")

  $.differ(duration).then(() =>
    target.setState("hidden")
  )
}

const open = ({ target }) => {
  target.setState("prepare")

  $.differ(50).then(() =>
    target.setState("open").get(0).focus()
  )
}

const handleFocusOut = (config) => {
  const { target } = config;

  return (e) => {
    if ((!e.relatedTarget
        || !$(e.relatedTarget).closest(`#${target.attr("id")}`).length)
      && $(e.target).attr("id") === target.attr("id")) {
      $.differ(200).then(() => close(config))
    } else {
      target.get(0).focus()
    }
  }
}

$.dropdown = function(context) {
  const dropdowns = $("[hb-toggle-slide]", context || $("body"))

  dropdowns.attr("tabindex", "-1")

  dropdowns.each((index, elem) => {
    const el = $(elem)
    const config = defaults(el)
    const { target } = config

    target.initState(states(el))

    target.attr("tabindex", "-1")

    target
      .off("focusout")
      .on("focusout", handleFocusOut(config))

    target.setState("init")
    target.setState("hidden")
  })

  dropdowns.off("click")

  dropdowns.on("click", (e) => {
    e.preventDefault();

    const el = $(e.currentTarget);
    const config = defaults(el);
    const { target } = config

    el.initState(selectorStates())

    el.setState("active")

    target.initState(states(el))

    if (!target.hasClass("opacity-100")) {
      open(config)
      el.get(0).focus()
    } else {
      el.get(0).blur()
    }
  })
}

$(() => $.dropdown())
