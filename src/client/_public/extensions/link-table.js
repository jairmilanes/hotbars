

$.fn.linkTable = function() {
  const container = this.parents(`div[data-input-container="${this.attr("name")}"]`)
  const tableName = this.data("table")
  const autocomplete = this
  const inputName = autocomplete.data("link-input")

  autocomplete.autcomplete(
    autocomplete.data("link-group-autocomplete"),
    autocomplete.data("table"),
    autocomplete.data("prop"),
    autocomplete.data("display-prop"),
    autocomplete.data("silent")
  )

  const table = $(`table[data-group="${inputName}"]`, container)

  if (!table.length) return;

  table.table(null)

  autocomplete.on("hb-selection-changed", (e) => {
    const { selected } = e.___td

    if (selected) {
      table.appendRow(selected)

      const payload = {
        name: inputName,
        table: tableName,
        added: selected,
        all: table.rows()
      }

      autocomplete.trigger("hb-link-added", payload)
      $.dispatch("hb-link-added", payload)
      autocomplete.clear()
    }
  })

  this.rows = table.rows
  this.addRow = table.addRow
  this.removeRow = table.removeRow
  this.setRows = table.setRows

  return this;
}

$.linkTable = function(context) {
  $("input[data-link-group-autocomplete][data-auto-init=true]", context).each((i, el) => {
    $(el).linkTable()
  })
}

$(() => {
  $.linkTable($("body"))
})