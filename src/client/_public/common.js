dayjs.extend(dayjs_plugin_relativeTime);
dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_customParseFormat);
dayjs.extend(dayjs_plugin_localizedFormat);
dayjs.extend(dayjs_plugin_advancedFormat);

class SideMenu {

  list = $("#hb-user-menu-container").list(
    "_sidemenu-item"
  )

  constructor() {
    $.subscribe("hb-update-site-menu", (e) => {
      console.log("UPDATE SIDE MENU", e)
      this.load(e.force)
    })
  }

  load(force) {
    const cached = this.cache("hb-menu-items")

    if (cached && !force) return this.handleUpdate({ items: cached });

    return fetch(`/_api/__types`)
      .then((response) => response.json())
      .then((response) => response.items)
      .then((types) => (types || []).map(item => ({
        path: `/_hotbars/type/${item.name.toLowerCase().trim().split(" ").join("-")}/`,
        title: item.name,
        icon: item.iconName
      })))
      .then((types) => {
        this.handleUpdate({ items: types })
        this.cache("hb-menu-items", JSON.stringify(types))
      })
  }

  cache(key, value) {
    if (!value) return JSON.parse(localStorage.getItem(key))
    localStorage.setItem(key, value)
  }

  handleUpdate(e) {
    const items = e.items;

    if (Array.isArray(items)) {
      this.list.reset()

      items.forEach((item) => {
        this.list.appendItem(item)
      })
    }
  }
}

function activateNavbarItem() {
  const activePath = location.pathname.replace(/\//g, "");

  const navbar = $("#navbar-default")

  $(`a[data-path="${activePath}"]`, navbar)
    .addClass("bg-rose-800 text-white")
    .attr("aria-current", "page");

  $(`a:not([data-path="${activePath}"])`, navbar)
    .removeClass("bg-rose-800 text-white")
    .removeAttr("aria-current");
}

$(async () => {
  await $.preloader.preload([
    "_sidemenu-item",
  ])

  /*********************************************
   * Sets the active menu item in the header.
   *********************************************/
  activateNavbarItem()

  /* $("[data-toggle]").on("click", (e) => {
    const elem = $(e.target);

    if (elem) {
      e.preventDefault();
      const id = elem.data("toggle");
      $(`#${id}`).toggle();
    }
  }); */

  $.subscribe("hb-nav-backward", async (e) => {
    if (location.pathname.startsWith("/_hotbars/type")) {
      const parts = location.pathname.split("/")
      const collection = parts[3]
      const recordId = parts[4]

      if (recordId) {
        location.href = "/_hotbars/type/" + collection
        return;
      }
    }

    if (navigation.canGoBack) {
      await navigation.back().finished
      return;
    }
  })

  const sideMenu = new SideMenu()

  sideMenu.load()
});
