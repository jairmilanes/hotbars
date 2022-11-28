$(() => {
  /*********************************************
   * Sets the active menu item in the header.
   *********************************************/
  const activePath = location.pathname.replace(/\//g, "");

  $(`a[data-path="${activePath}"]`)
    .removeClass("text-white/[.85]")
    .addClass("bg-rose-800 text-white")
    .attr("aria-current", "page");

  $(`a:not([data-path="${activePath}"])`)
    .addClass("text-white/[.85]")
    .removeClass("bg-rose-800 text-white")
    .removeAttr("aria-current");
});
