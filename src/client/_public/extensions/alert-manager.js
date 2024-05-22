


$.fn.alerts = function() {

  const list = this.list(
    "_alert-message"
  )

  const timers = {}

  list.on("hb-list-changed", (e) => {
    const { type, item } = e.___td;

    if (type === "appended") {
      clearTimeout(timers[item.id])

      timers[item.id] = setTimeout(() => {
        list.removeItem(item.id)
      }, 3000)
    }

    if (type === "removed") {
      clearTimeout(timers[item])
    }
  })

  this.reset = list.reset.bind(list)
  this.add = list.appendItem.bind(list)
  this.remove = list.removeItem.bind(list)

  return this;
}