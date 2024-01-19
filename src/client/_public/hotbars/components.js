function buttons() {
  $("#hb-loader-btn").button().loading(true, "Loading...")

  $("#hb-confirm-modal").on("click", (e)=> {
    $.modals.confirm({
      id: "test-confirm",
      message: "Are you sure?"
    })
  })

  $("#hb-alert-modal").on("click", (e)=> {
    $.modals.alert({
      id: "test-alert",
      message: "This is an alert!",
      cancelText: "Ok!"
    })
  })

  $("#hb-toast-trigger").on("click", () => {
    $.toast(
      "success",
      "Custom toast message",
      5000,
        "top-left")
  })

  $(".hb-load-code").on("click", () => {

  })

  Prism.plugins.NormalizeWhitespace.setDefaults({
    'remove-trailing': true,
    'remove-indent': true,
    'left-trim': true,
    'right-trim': true,
    // 'break-lines': 1000,
    // 'indent': 0,
    // 'remove-initial-line-feed': true,
    // 'tabs-to-spaces': 4,
    // 'spaces-to-tabs': 4
  })

  // Prism.highlightAll()
}

$(() => {
  buttons()
})