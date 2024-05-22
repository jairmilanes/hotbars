$.fn.autcomplete = function(name, table, prop, displayProp, silent = false) {
  this.timer = null
  this.container = this.parents("div[data-input-container]")
  this.clearBtn = $("button[data-autocomplete-clear]", this.container)

  console.log("CLEAR BTN", this.clearBtn)

  this.list = $("ul[data-autocomplete-list]", this.container)
    .list("form/autocomplete-row", "form/autocomplete-row")
  this.valueInput = $(`input[name="${name}"]`, this.container)
  this.data = []
  this.loader = $('div[data-loader]', this.container)

  this.list.hide()

  const search = (query) => {
    const url = $.url(`/_api/${table}`, {
      [`${displayProp || prop}_like`]: query
    })
    return $.rest.get(url).then((response) => response.items)
  }

  const load = (id) => {
    console.log("WTF", {...($.rest || {})})
    const url = $.url(`/_api/${table}/${id}`)
    return $.rest.get(url).then((response) => response)
  }

  this.handleSelect = (e) => {
    const { target, value, id } = e
    console.log("SELECTING", id, target, value)
    if (target === this.attr("name")) {
      const selected = this.data.find(item => item.id === id)

      if (!silent) {
        this.val(selected[displayProp || prop])
        this.valueInput.val(selected[prop])
      }

      this.trigger("hb-selection-changed", {
        selected,
        form: this.parents("form")?.attr("id"),
        field: target,
      })

      this.list.reset()
    }
  }

  this.clear = () => {
    this.val("")
    this.list.reset()
    this.clearBtn.hide()
  }

  this.on("keyup", (e) => {
    clearTimeout(this.timer)

    if (e.target.value.length > 0) {
      this.clearBtn.show()
    } else {
      this.clearBtn.hide()
    }

    if (e.target.value.length < 2) {
      return;
    }

    this.list.show()
    this.loader.show()
    this.list.reset()

    this.timer = setTimeout(() => {
      search(e.target.value)
        .then(items => {
          this.data = items;

          if (this.data?.length > 0) {
            this.data.forEach(item => {
              this.list.appendItem({
                id: item.id,
                name: this.attr("name"),
                text: item[displayProp || prop],
                value: item[prop]
              })

              $.dispatch(this.list.lastEl())
            })
          }

          this.loader.hide()
          this.timer = null
        })
    }, 1000)
  })

  this.on("focusout", (e) => {
    setTimeout(() => {
      if (!this.timer) {
        this.loader.hide()
        this.list.hide()
      }
    }, 300)
  })

  this.on("focusin", (e) => {
    if (this.list.size() > 0) {
      this.list.show()
    }
  })

  this.clearBtn.on("click", (e) => {
    this.val("")
    this.valueInput.val("")
    this.list.reset()
    this.clearBtn.hide()
  })

  if (this.valueInput.val()) {
    load(this.valueInput.val())
      .then(selected => {
        this.val(selected[displayProp || prop])

        this.trigger("hb-value-loaded", {
          selected,
          form: this.parents("form")?.attr("id"),
          field: name,
        })
      })
  }

  $.subscribe("hb-autocomplete-select", this.handleSelect.bind(this))

  return this;
}

$.autocomplete = function(context) {
  $(`input[data-autocomplete][data-auto-init="true"]`, context).each((i, el) => {
    if (!$(el).data("table") || !$(el).data("prop")) return;

    $(el).autcomplete(
      $(el).data("autocomplete"),
      $(el).data("table"),
      $(el).data("prop"),
      $(el).data("display-prop"),
      $(el).data("silent")
    )
  })

  $(`input[data-user-autocomplete][data-auto-init="true"]`, context).each((i, el) => {
    if (!$(el).data("table") || !$(el).data("prop")) return;

    console.log("USER AUTOCOMPLETE", el)

    const name = $(el).data("user-autocomplete")
    const display = $("div[data-autocomplete-display]", $(el).parents("div[data-input-container]"))
    const autocomplete = $(el).autcomplete(
      $(el).data("user-autocomplete"),
      $(el).data("table"),
      $(el).data("prop"),
      $(el).data("display-prop"),
      true
    )

    const container = autocomplete.parent()

    console.log("DISMISS SETUP", display)
    $.dismiss(null, display, (e) => {
      autocomplete.val("")
      container.show()
    })

    autocomplete
      .on("hb-value-loaded", (e) => {
        const { selected } = e.___td
        console.log("VALUE LOADED", selected)
        display.render("_user-simple", {
          ...selected,
          closable: true,
          paddingY: 2,
          paddingX: 4
        })

        display.show()
        container.hide()

        $.dispatch(display)
        $.dismiss(null, display, (e) => {
          autocomplete.val("")
          container.show()
        })
      })

    autocomplete
      .on("hb-selection-changed", (e) => {
        const { selected } = e.___td

        display.render("_user-simple", {
          ...selected,
          closable: true,
          paddingY: 2,
          paddingX: 4
        })

        display.show()
        container.hide()

        autocomplete.valueInput.val(selected[$(el).data("prop")])

        $.dispatch(display)
        $.dismiss(null, display, (e) => {
          autocomplete.val("")
          container.show()
        })
      })

  })

  $(`input[data-link-autocomplete][data-auto-init="true"]`, context).each((i, el) => {
    if (!$(el).data("table") || !$(el).data("prop")) return;
    const display = $("div[data-autocomplete-display]", $(el).parents("div[data-input-container]"))
    const autocomplete = $(el).autcomplete(
      $(el).data("link-autocomplete"),
      $(el).data("table"),
      $(el).data("prop"),
      $(el).data("display-prop"),
      true
    )

    const container = autocomplete.parent()

    autocomplete.on("hb-value-loaded", (record) => {
      // console.log("RECORD LOADED", record)
    })

    autocomplete
      .on("hb-selection-changed", (e) => {
        const { selected } = e.___td

        display
          .show()
          .render("form/autocomplete-link-display", {
            name: selected.name,
            link: {
              title: selected[$(el).data("display-prop") || $(el).data("prop")],
              id: selected[$(el).data("prop")],
            },
            closable: true,
            paddingY: 2,
            paddingX: 4
          })

        container.hide()

        $.dispatch(display)
        $.dismiss(null, display, (e) => {
          autocomplete.val("")
          container.show()
        })
      })
  })
}

$(() => {
  $.autocomplete($("body"));
})