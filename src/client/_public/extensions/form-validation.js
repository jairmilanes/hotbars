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
  this.silent =  this.form.attr("hb-silent") === "true";
  this.preventDefault = this.form.attr("hb-prevent-default") === "true";
  this.captchaEl = this.captchaName ? $(`div#${this.captchaName}`) : null;
  this.captchaId = null;
  this.submitButton = $(`button[type="submit"]`, this.form)
  this.needsValidation = this.form.attr("hb-needs-validation") === "true"
  this.alertsEl = $(`div[hb-alert-for="${this.form.attr("id")}"]`)
  this.lastSubmitHtml = null

  if (this.needsValidation) {
    this.submitButton.attr("disabled", true);
  }

  this.validated = Object.keys(constrains)
    .reduce((obj, key) => {
      obj[key] = false;
      return obj;
    }, {})

  this.errors = {}

  this.freeze = () => {
    if(this.silent) return;
    this.lastSubmitHtml = this.submitButton.html()

    this.submitButton
      .render("spinner", {
        size: 5,
        color: "white"
      })
      .attr("disabled", "disabled")
  }

  this.unfreeze = () => {
    if(this.silent) return;

    this.submitButton
      .html(this.lastSubmitHtml || "Send Message")
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
    if (!this.needsValidation) return true;
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
    if(this.silent) return;

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
    if(this.silent) return;

    this.clearAlerts()

    messages.forEach((message) => {
      this.alertsEl.render(
        "alert-message", message, "append")
    })
  }

  this.validate = async (field) => {
    const isValid = field.get(0).checkValidity();

    field.attr('aria-invalid', !isValid);

    const fieldConstrains = constrains[field.attr("name")]
    const data = { [field.attr("name")]: field.val() }
    const filteredConstrais = {
      [field.attr("name")]: constrains[field.attr("name")]
    }

    // Add equality input to data and constrains
    if (fieldConstrains && fieldConstrains.equality) {
      const equalityName = fieldConstrains.equality;

      const equalityInput = this.form.find(`input[name="${equalityName}"]`)

      if (equalityInput) {
        data[equalityName] = equalityInput.val()
        filteredConstrais[equalityName] = constrains[equalityName]
      }
    }

    const success = () => {
      delete this.errors[field.attr("name")]
      this.validated[field.attr("name")] = true;
    }

    const error = (invalids) => {
      this.errors = { ...this.errors, ...invalids }
      this.validated[field.attr("name")] = false;
      return invalids[field.attr("name")]
    }

    console.log("fieldConstrains", fieldConstrains)
    await validate
      .async(data, filteredConstrais)
      .then(success, error);
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

    if (this.captchaEl && this.captchaEl.length > 0) {
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

    await this.delay(2000);

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

  this.set = (name, value) => {
    if (!value && name !== null && typeof name === "object") {
      Object.keys(name).forEach(key => {
        this.form.find(`[name="${key}"]`).val(name[key])
      })
    }
    this.form.find(`[name="${name}"]`).val(value)
  }

  this.form.on("change focusout", async (e) => {
    const field = $(e.target);

    if (["INPUT", "TEXTAREA"].indexOf(e.target.nodeName) < 0) return;

    this.resetFeedback(field)
    this.clearAlerts()

    if (this.needsValidation) {
      await this.validate(field)

      console.warn("Validation errors", this.errors)

      if (this.errors[field.attr("name")]) {
        this.feedback(field, false, this.errors[field.attr("name")].join("<br />"))
      }
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

    this.form.trigger("hb-form-changed", {
      name: field.attr("name"),
      value: field.val(),
      valid: this.valid(),
      field
    })
  })

  this.form.on("submit", async (e) => {
    const eventData = {
      id: this.form.attr("id"),
      method: this.form.attr("method").toLowerCase(),
      action: this.form.attr("action"),
      form: this.form
    }

    if (this.form.attr("hb-ajax") !== "true") {
      if (this.preventDefault) {
        e.preventDefault()
        this.form.trigger("hb-submit", eventData)
      }
      return;
    }

    e.preventDefault()

    this.form.trigger("hb-before-submit", eventData)

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

      eventData.response = response;

      this.resetForm()
      this.unfreeze()
      this.form.trigger("hb-after-submit", eventData)
    })
  })

  this.form.attr("hb-init", "true")

  return this
}

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function parseValue(value) {
  if (["true", "false"].indexOf(value) > -1) {
    return value === "true";
  }

  if (isNumeric(value)) {
    if (value.indexOf('.') > -1) return parseFloat(value)
    return parseInt(value)
  }

  if (value.indexOf(',') > -1) return value.split(',').map(v => v.trim())

  return value;
}

(function() {
  /* if (!validate || typeof validade !== "function") {
    console.warn("Validation library not found!");
    return;
  } */

  const init = function() {
    $(`form[hb-auto="true"]:not([hb-init="true"])`).each((i, form) => {
      const constrains = {}

      $("input, textarea, select", $(form)).each((i, elem) => {
        const input = $(elem)
        const inputName = input.attr("name")
        console.log("inputName", inputName)

        Array.from(elem.attributes).forEach(
          ({ name, value }) => {
            if (name.startsWith("hb-validate-")) {
              if (!constrains[inputName]) {
                constrains[inputName] = { type: input.attr("type") };
              }
              const constrain = name.replace("hb-validate-", "");
              const constrainValue = parseValue(value)
              const config = {}

              Array.from(elem.attributes).forEach(({ name, value }) => {
                if (name.startsWith(`hb-${constrain}-`)) {
                  config[name.replace(`hb-${constrain}-`, "")] = constrainValue
                }
              })

              if (!Object.keys(config).length) {
                constrains[inputName][constrain] = constrainValue;
              } else {
                constrains[inputName][constrain] = config;
              }
            }
          }
        )
      })
      console.log("form init", constrains)
      $(form).form(constrains)
    })
  }

  $.fn.form = FormValidation
  $.forms = init

  init();
})()