
const labelStates = (name) => {
  switch(name) {
    case "active":
      return `active bg-base-light hover:bg-base-bright dark:bg-base-pitch dark:hover:bg-base-darker cursor-pointer`
    case "disabled":
      return `disabled border-gray-100 dark:border-gray-800 cursor-not-allowed`
    case "inactive":
      return 'inactive border-base-light hover:border-base-lighter dark:border-base-darker dark:hover:border-base-dark bg-base-light hover:bg-base-bright dark:bg-base-pitch dark:hover:bg-base-darker cursor-pointer'
    case "hidden":
      return `hidden`
    default:
      return ["active", "disabled", "inactive", "hidden"]
  }
}

const listStates = (name) => {
  switch(name) {
    case "visible":
      return ``
    case "hidden":
      return `hidden`
    default:
      return ["visible", "hidden"]
  }
}

$.fn.dropzone = function() {
  const id = this.attr("id")
  const input = this
  const container = input.parents(`div[data-input-container]`)
  const name = input.attr("name") || input.attr("id")
  const maxCount =  parseInt(input.data("max-input") || "1", 10)
  const maxSize =  parseInt(input.data("max-size") || "2000000", 10)
  const type =  input.data("type")
  const list = container.find('ul').list(
    type === "image" ? "_dropzone-img-file" : "_dropzone-file"
  )
  const label = container.find(`label[data-input="true"]`)
  const count = $("span[data-count]", container)
  const total = $("span[data-total]", container)

  label.initState(labelStates)
  list.initState(listStates)

  const toggleViews = (view) => {
    ["active", "inactive", "error"].forEach((type) => {
      if (type === view) {
        $(`div[data-view-${type}]`, container).show()
      } else {
        $(`div[data-view-${type}]`, container).hide()
      }
    })
  }

  list.on("hb-list-changed", (e) => {
    if (e.___td.count === 0) {
      toggleViews("inactive")
      label.setState("inactive")
      list.setState("hidden")
      input.prop("disabled", "")
    } else if (e.___td.count < maxCount) {
      toggleViews("active")
      label.setState("active")
      list.setState("visible")
      input.prop("disabled", "")
    } else if(e.___td.count === maxCount) {
      toggleViews("active")
      label.setState("disabled")
      list.setState("visible")
      input.prop("disabled", "disabled")
    } else {
      toggleViews("error")
      label.setState("disabled")
      list.setState("visible")
      input.prop("disabled", "disabled")
    }

    count.text(e.___td.count)
    total.text(maxCount)

    input.trigger("change", { bypassList: true })
  })

  input.on("change", (e) => {
    const { files } = e.target

    if (e?.___td?.bypassList) return;

    if (files.length) {
      for (let i = 0; i < files.length; i++) {
        const exists = list.getItem(files[i].name)

        if (!exists) {
          const file = {
            name: files[i].name,
            size: files[i].size,
            type: files[i].type,
            file: files[i]
          }

          if (type === "image") {
            file.previewUrl = URL.createObjectURL(files[i])
          }

          list.appendItem(file)
        }
      }
    }

    input.val("")

    input.trigger("hb-changed", {
      name: name,
      files: list.all()
    })
  })

  this.getFiles = () => {
    return list.all()
  }

  toggleViews("inactive")

  label.setState("inactive")
  list.loadStatic()

  return this;
}

$.dropzone = function(context) {
  $(`input[data-dropzone]`, context).each(
    (i, el) => {
      $(el).dropzone()
    }
  )
}

$(() => {
  $(`input[data-dropzone][data-auto-init="true"]`).each(
    (i, el) => $(el).dropzone()
  )
})