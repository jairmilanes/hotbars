$(() => {
  /***************************************
   * DARKMODE CONTROLS
   **************************************/
  let theme =
    localStorage.getItem("color-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  if (["light", "dark"].indexOf(theme) < 0) {
    theme = "light";
  }

  const { classList } = document.documentElement;

  if (theme === "dark") {
    classList.add("dark");
  } else {
    classList.remove("dark");
  }

  const darkIcon = document.getElementById("theme-toggle-dark-icon");
  const lightIcon = document.getElementById("theme-toggle-light-icon");

  if (darkIcon && lightIcon) {
    // Change the icons inside the button based on previous settings
    if (theme) {
      lightIcon.classList.remove("hidden");
    } else {
      darkIcon.classList.remove("hidden");
    }

    const toggleBtn = document.getElementById("theme-toggle");

    toggleBtn.addEventListener("click", function () {
      // toggle icons inside button
      darkIcon.classList.toggle("hidden");
      lightIcon.classList.toggle("hidden");

      const theme = localStorage.getItem("color-theme");
      const { classList } = document.documentElement;

      // if set via local storage previously
      if (theme) {
        if (theme === "light") {
          classList.add("dark");
          localStorage.setItem("color-theme", "dark");
        } else {
          classList.remove("dark");
          localStorage.setItem("color-theme", "light");
        }
        // if NOT set via local storage previously
      } else {
        if (classList.contains("dark")) {
          classList.remove("dark");
          localStorage.setItem("color-theme", "light");
        } else {
          classList.add("dark");
          localStorage.setItem("color-theme", "dark");
        }
      }
    });
  }
});
