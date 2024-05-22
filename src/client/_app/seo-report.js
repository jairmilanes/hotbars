

class SeoReportPage {
  container = $("#report")
  frame = $(this.container.find("iframe").get(0).contentWindow.document)

  constructor() {
    this.frame
      .find(".lh-topbar")
      .remove()

    if (this.container.data("theme") === "dark") {
      this.frame.find("article").addClass("lh-dark")
    } else {
      this.frame.find("article").removeClass("lh-dark")
    }

    $("#theme-toggle").on("click", () => {
      this.toggleDarkMode()
    })
  }

  toggleDarkMode() {
    this.frame.find("article").toggleBeetweenClasses(
      "lh-dark", ""
    )
  }
}



$(() => new SeoReportPage())