function saveToSettings(data) {
  return fetch("/_api/settings", {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
}

function getDarkMode() {
  const theme =  localStorage.getItem("color-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  return theme === "dark"
}

function initTheme() {
  const darkMode = getDarkMode();

  const { classList } = document.documentElement;

  if (darkMode) {
    classList.add("dark");
  } else {
    classList.remove("dark");
  }
}

function updatePrismTheme(darkMode) {
  const linkEL = $(`link[href*="/prism-${darkMode ? "dark" : "light"}.css"]`)

  if (linkEL.length > 0) {
    const link = linkEL.attr("href")
    linkEL.attr("href", link.replace(
      darkMode ? "dark" : "light",
      darkMode ? "light" : "dark"
    ))
  }
}

/***************************************
 * DARKMODE CONTROLS
 **************************************/
function initThemeButtons() {
  const darkMode = getDarkMode()
  const darkIcon = $("#theme-toggle-dark-icon").addClass("hidden");
  const lightIcon = $("#theme-toggle-light-icon").addClass("hidden");

  if (darkIcon && lightIcon) {
    // Change the icons inside the button based on prev
    // ious settings
    if (darkMode) {
      lightIcon.removeClass("hidden");
    } else {
      darkIcon.removeClass("hidden");
    }

    $("#theme-toggle").on("click", () => {
      const darkMode = getDarkMode()
      // toggle icons inside button
      darkIcon.toggleClass("hidden");
      lightIcon.toggleClass("hidden");

      const { classList } = document.documentElement;

      if (darkMode) {
        classList.remove("dark");
        localStorage.setItem("color-theme", "light");
      } else {
        classList.add("dark");
        localStorage.setItem("color-theme", "dark");
      }

      updatePrismTheme(darkMode)

      saveToSettings({
        theme: darkMode ? "light" : "dark"
      })
    });
  }
}

async function initSidePanel() {
  const openBtn = $("#hb-open-side-panel")
  const closeBtn = $("#hb-close-side-panel")
  const menu = $("#hb-side-panel")

  const callback = (open) => {
    if (open) {
      menu.addClass("open")
    } else {
      menu.removeClass("open")
    }

    saveToSettings({
      sidePanel: open
    })
  }

  openBtn.toggleElClass("hb-side-panel", "open", callback)
  closeBtn.toggleElClass("hb-side-panel", "open", callback)
}

$(() => {
  // initTheme();
  initThemeButtons();
  initSidePanel();
});

