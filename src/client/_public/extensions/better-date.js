

$.fn.betterDate = function(context) {
  const format = this.data("format")
  const trigger = $(`input[name="${this.attr("name")}-trigger"]`)

  trigger.on("change", (e) => {
    if (dayjs) {
      this.val(dayjs.utc(e.target.value, "YYYY/MM/DD").format(format))
    }
  })
}

$.betterDate = function(context) {
  $(`input[data-input-type="date"]`, (context || $("body")))
    .each((i, el) => $(el).betterDate(context))
}


$(() => {
  $.betterDate()
})