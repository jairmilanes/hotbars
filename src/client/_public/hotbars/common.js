$(() => {
  dayjs.extend(dayjs_plugin_relativeTime);

  /*********************************************
   * Sets the active menu item in the header.
   *********************************************/
  const activePath = location.pathname.replace(/\//g, "");
  const navbar = $("#navbar-default")
  $(`a[data-path="${activePath}"]`, navbar)
    .addClass("bg-rose-800 text-white")
    .attr("aria-current", "page");

  $(`a:not([data-path="${activePath}"])`, navbar)
    .removeClass("bg-rose-800 text-white")
    .removeAttr("aria-current");

  $("[data-toggle]").on("click", (e) => {
    const elem = $(e.target);

    if (elem) {
      e.preventDefault();
      const id = elem.data("toggle");
      $(`#${id}`).toggle();
    }
  });
});
