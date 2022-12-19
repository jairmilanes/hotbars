(function ($) {
  function statesRegex(className = "") {
    const states = className.split(":").slice(0, -1);
    const targetStates = ["dark", "focus", "hover", "invalid"]
      .filter((st) => states.indexOf(st) < 0)
      .map((state) => state.concat(":"));
    return new RegExp(`(${targetStates.join("|")})`, "g");
  }

  function clearStates(className, filter) {
    return className.replace(statesRegex(filter), "");
  }

  $.fn.extend({
    tw: function () {
      return {
        swapColor: (color1, color2, target = [], skip = []) => {
          const classes = this.attr("class").split(/\s/g);

          const newClasses = classes
            .map((name) => {
              const clean = clearStates(name);
              const match = target.find((targetName) =>
                clean.startsWith(targetName)
              );

              if (match) {
                return name.replace(color1, color2);
              }

              if (skip.length) {
                const shoudlSkip = skip.some((skipName) =>
                  clean.startsWith(skipName)
                );

                if (!shoudlSkip) {
                  return name.replace(color1, color2);
                }
              }

              return name;
            })
            .join(" ");

          this.attr("class", newClasses);

          return this.tw();
        },
        setIntensity: (targetObj) => {
          const targets = Object.keys(targetObj);
          const classes = this.attr("class").split(/\s/g);

          const newClasses = classes.map((name) => {
            const target = targets.find((t) =>
              clearStates(name, t).startsWith(t)
            );

            if (target) {
              return name.replace(/\d{3}/, targetObj[target]);
            }

            return name;
          });

          this.attr("class", newClasses.join(" "));

          return this.tw();
        },
      };
    },
  });
})(jQuery);

async function onSubmitWithCaptcha(token, captchaName) {
  const response = await fetch(`/re-captcha/verify/${token}`);
  const captchaElem = $(`#${captchaName}`);

  if (response.status === 200) {
    $("button[type=submit]").removeAttr("disabled");
    captchaElem.data("captcha", true);
    return;
  }

  grecaptcha.reset();

  captchaElem.data("loaded", false);
  captchaElem.data("captcha", false);
}

$(() => {
  const form = $("form");

  const validator = form.validate({
    rules: {
      "confirm-password": {
        equalTo: "#password",
      },
    },
    highlight: (element) => {
      $(element)
        .tw()
        .swapColor("gray", "error", ["bg", "text", "border", "placeholder"])
        .setIntensity({ "dark:bg": "200", "dark:text": "700" });
    },
    unhighlight: (element) => {
      $(element)
        .tw()
        .swapColor("error", "gray", ["bg", "text", "border", "placeholder"])
        .setIntensity({ "dark:bg": "700", "dark:text": "200" });
    },
    errorPlacement: (error, element) => {
      error.appendTo(`#${element.attr("name")}-hint`);
    },
  });

  const captchaName = form.data("captcha");
  const submit = form.find("button[type=submit]");

  form.on("change", (e) => {
    const errors = validator.numberOfInvalids();
    const blanks = $("input[required]:blank").length;
    const uncheckeds = $(
      "input[type=radio][required]:unchecked, input[type=checkbox][required]:unchecked"
    ).length;

    if (!errors && !blanks && !uncheckeds) {
      if (captchaName) {
        const captchaElem = $(`#${captchaName}`);

        if (!captchaElem.data("loaded")) {
          grecaptcha.render(captchaName, {
            sitekey: captchaElem.data("sitekey"),
            theme: "light",
          });

          captchaElem.data("loaded", true);
        }

        if (captchaElem.data("captcha")) {
          submit.removeAttr("disabled");
        }
      }

      if (!captchaName) {
        submit.removeAttr("disabled");
      }
    } else {
      submit.attr("disabled", "");
    }
  });
});
