

function mobileMenu(duration, direction = "down", bg) {
  $("#menu-toggle").on("click", (e) => {
    const el = $(e.currentTarget);
    const menuId = el.attr("hb-toggle")
    const menu = $(`#${menuId}`);
    const close = $(`[hb-toggle="${menuId}"]`, menu)

    menu.toggleBeetweenClasses("z-[1000]", "z-[-1]")
    menu.toggleBeetweenClasses("opacity-0", "opacity-100")
    menu.toggleBeetweenClasses("left-1/4", "left-0")

    $("body").swapClass("overflow-auto", "overflow-hidden")

    close.one("click", () => {
      menu.toggleBeetweenClasses("z-[-1]", "z-[1000]")
      menu.toggleBeetweenClasses("opacity-100", "opacity-0")
      menu.toggleBeetweenClasses("left-0", "left-1/4")
      $("body").swapClass("overflow-hidden", "overflow-auto")
    })

    menu.one("swiped-right", () => {
      menu.toggleBeetweenClasses("z-[-1]", "z-[1000]")
      menu.toggleBeetweenClasses("opacity-100", "opacity-0")
      menu.toggleBeetweenClasses("left-0", "left-1/4")
      $("body").swapClass("overflow-hidden", "overflow-auto")
    })
  });

  $(document).on("swiped-left", () => {
    $("#menu-toggle").trigger("click");
  })
}

(() => {
  $.fn.extend({
    mobileMenu: mobileMenu
  })
})()