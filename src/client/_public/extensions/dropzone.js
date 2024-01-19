
$.fn.dropzone = function() {
  const input = this.find(`input[type="file"]`)
  const maxCount = this.data("max-size") || 1
  const multiple = input.attr("multiple") || 1
  const list = this.find('ul').list("_dropzone-file")
  const label = this.find("label")
  const feedback = this.find(`[hb-feedback-invalid="true"]`)


  list.on("hb-list-changed", (e) => {
    if (e.___td.count === 0) {
      label.show()
      label.swapClass("border-green-600", "border-gray-300")
      label.swapClass("dark:border-green-600", "dark:border-gray-600")
    }
  })

  input.on("change", (e) => {
    const { files } = e.target
    list.reset()

    if (files.length) {
      if (multiple && files.length > maxCount) {
        feedback.html(`Maximum allowed files is ${maxCount}.`)
        return;
      }

      label.swapClass("border-gray-300", "border-green-600")
      label.swapClass("dark:border-gray-600", "dark:border-green-600")

      for (let i = 0; i < files.length; i++) {
        list.appendItem({
          id: files[i].name,
          name: files[i].name,
          size: files[i].size
        })
      }

      if (files.length >= maxCount) {
        label.hide()
      }
    } else {
      label.swapClass("border-green-600", "border-gray-300")
      label.swapClass("dark:border-green-600", "dark:border-gray-600")
    }
  })

  return this;
}

$(() => {
  $(`[data-dropzone]`).each(
    (i, el) => {
      $(el).dropzone()
    }
  )
})