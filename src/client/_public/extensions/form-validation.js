/**
 * Using validatejs
 *
 * https://validatejs.org/
 */
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

function FormValidation(constrains, beforeSubmit) {
  this.form = $(this);
  this.captchaName =  this.form.attr("hb-captcha");
  this.captchaEl = $(`div#${this.captchaName}`)
  this.captchaId = null;
  this.submitButton = $(`button[type="submit"]`, this.form)
  this.needsValidation = this.form.attr("hb-needs-validation") === "true"
  this.alertsEl = $(`div[hb-alert-for="${this.form.attr("id")}"]`)

  this.submitButton.attr("disabled", true);

  this.validated = Object.keys(constrains)
    .reduce((obj, key) => {
      obj[key] = false;
      return obj;
    }, {})

  this.errors = {}

  this.freeze = () => {
    this.submitButton
      .render("spinner", {
        size: 5,
        color: "white",
        message: "Sending message, please hold..."
      })
      .attr("disabled", "disabled")
  }

  this.unfreeze = () => {
    this.submitButton
      .html("Send Message")
      .removeAttr("disabled")
  }

  this.disable = (disabled = true) => {
    if (disabled) {
      this.submitButton.attr("disabled", "disabled");
    } else {
      this.submitButton.removeAttr("disabled");
    }
  }

  this.valid = () => {
    return Object.keys(this.validated)
      .every((key) => this.validated[key])
  }

  this.feedbackEl = (field) => {
    const container = field.parent("div");
    const validEl = $(`div[hb-feedback-valid="true"] label`, container)
    const invalidEl = $(`div[hb-feedback-invalid="true"] label`, container)
    return { validEl, invalidEl }
  }

  this.resetFeedback = (field) => {
    const { validEl, invalidEl } = this.feedbackEl(field)
    validEl.html("")
    invalidEl.html("")
  }

  this.feedback = (field, valid, message) => {
    const { validEl, invalidEl } = this.feedbackEl(field)

    field.attr('aria-invalid', !valid);

    if (!valid) {
      this.disable()
      invalidEl.html(message)
    } else {
      validEl.html(message)
    }
  }

  this.clearAlerts = () => {
    this.alertsEl.html("");
  }

  this.alert = (messages) => {
    this.clearAlerts()

    messages.forEach((message) => {
      this.alertsEl.render(
        "alert-message", message, "append")
    })
  }

  this.validate = (field) => {
    const isValid = field.get(0).checkValidity();

    field.attr('aria-invalid', !isValid);

    const invalids = validate({
      [field.attr("name")]: field.val()
    }, {
      [field.attr("name")]: constrains[field.attr("name")]
    });

    if (invalids) {
      this.errors = { ...this.errors, ...invalids }
      this.validated[field.attr("name")] = false;
      return invalids[field.attr("name")]
    } else {
      delete this.errors[field.attr("name")]
      this.validated[field.attr("name")] = true;
    }
  }

  this.captcha = () => {
    if (!this.captchaEl.data("loaded")) {
      this.captchaId = grecaptcha.render(this.captchaName, {
        sitekey: this.captchaEl.data("sitekey"),
        theme: "light",
      });

      this.captchaEl.data("loaded", true);
    }

    if (this.captchaEl.data("captcha")) {
      this.disable(false)
    }
  }

  this.resetForm = () => {
    this.errors = {}

    this.validated = Object.keys(constrains)
      .reduce((obj, key) => {
        obj[key] = false;
        return obj;
      }, {})

    this.form.get(0).reset()
    this.disable()

    if (this.captchaEl.length > 0) {
      grecaptcha.reset(this.captchaId)
    }
  }

  this.delay = (time) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time)
    })
  }

  this.request = async (url, data) => {
    const method = this.form.attr("method").toUpperCase();
    const params = new URLSearchParams();
    const body = ["POST", "PUT", "PATCH"].indexOf(method) > -1
    const contentType = this.form.attr("hb-content-type") || "application/json"

    if (method === "GET") {
      Object.keys(data).forEach((key) => {
        params.set(key, data[key])
      })
    }

    const target = params.toString().length > 0 ? url.concat("?", params.toString()) : url

    await this.delay(10000);

    return fetch(target, {
      method,
      body: body ? JSON.stringify(data) : null,
      headers: {
        "content-type": contentType
      }
    })
      .then(responseObj => responseObj.json())
      .catch((err)  => {
        console.error(err)

        this.alert([{
          level: "error",
          message: "An unexpected error have acurred while processing your request, please try again later.",
          closable: true
        }])
      });
  }

  this.data = () => {
    const data = this.form.formToObject()

    if (typeof beforeSubmit === "function") {
      return beforeSubmit(data);
    }

    return data;
  }

  if (this.needsValidation) {
    this.form.on("change focusout", (e) => {
      const field = $(e.target);

      if (["INPUT", "TEXTAREA"].indexOf(e.target.nodeName) < 0) return;

      this.resetFeedback(field)
      this.clearAlerts()

      const errors = this.validate(field)

      if (errors) {
        this.feedback(field, false, errors.join("<br />"))
      }

      if (this.valid()) {
        if (this.captchaName) {
          this.captcha()
        } else {
          this.disable(false)
        }
      } else {
        this.disable()
      }
    })
  }

  if (this.form.attr("hb-ajax") !== "true") {
    return;
  }

  this.form.on("submit", async (e) => {
    e.preventDefault()
    e.stopPropagation()

    this.freeze();

    this.request(
      this.form.attr("action"),
      this.data()
    ).then((response) => {

      this.alert([{
        level: "success",
        message: this.form.attr("hb-success-message") || "Message received!",
        closable: true
      }])

      this.unfreeze()
      this.resetForm()
    })
  })
}

(function() {
  /* if (!validate || typeof validade !== "function") {
    console.warn("Validation library not found!");
    return;
  } */

  $.fn.form = FormValidation
})()