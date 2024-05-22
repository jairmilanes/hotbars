$.fn.upload = function(userMaxSize, types) {
  const input = this
  const container = input.parents("div[data-input-container]")
  const id = input.attr("id")
  const name = input.attr("name") || input.attr("id")
  const maxSize = userMaxSize || parseInt(input.data("max-size") || "2097152", 10)
  const preview = $("div[data-upload-preview]", container)
  const close = $(`#${input.attr("name")}-close`, preview)

  const togglePreview = () => {
    const file = input.get(0).files[0]

    if (file) {
      $("img", preview)
        .attr("src", URL.createObjectURL(file))
        .next()
        .html(file.name)
      preview.show()
      input.hide()
    } else {
      input.reset()
      $("img", preview).attr("src", "")
    }
  }

  input.on("change", (e) => {
    const { files } = e.target

    $.inputFeedback(input)

    if (files.length > 1) {
      return;
    }

    if (!files.length) {
      return;
    }

    if(files[0].size > maxSize) {
      $.inputFeedback(input, "File is too big!", false)
      input.val("");
    }

    togglePreview()
  })

  close.on("click", () => {
    const fileId = input.data("file-id")
    input.removeAttr("data-file-id")
    this.reset()
    input.trigger("hb-preview-closed", {
      name: input.attr("name"),
      fileId,
      input,
      preview
    })
  })

  this.reset = () => {
    input.val("");
    $("img", preview).removeAttr("src")
    preview.hide()
    input.show()
    input.trigger("change")
  }

  return this
}

$.upload = function(context) {
  $("input[type=file]:not([data-dropzone])", context)
    .each((i, el) => $(el).upload())
}

$(() => {
  $("input[type=file][data-auto-init=true]:not([data-dropzone])", $("body"))
    .each((i, el) => $(el).upload())
})
