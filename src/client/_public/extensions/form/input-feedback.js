
$.inputFeedback = function inputFeedback(input, message, valid) {
  const container = input.parents(`div[data-input-container]`)

  if (!message) {
    $(`div[hb-feedback-valid]`, container)
      .hide()
      .find('label')
      .html("")

    $(`div[hb-feedback-invalid]`, container)
      .hide()
      .find('label')
      .html("")
    return;
  }

  const feedbackEl = $(`div[hb-feedback-${valid ? 'valid' : 'invalid'}]`, container)
  feedbackEl.show()
  feedbackEl.find('label').text(message)
}