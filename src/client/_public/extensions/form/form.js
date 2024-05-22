import { isNumeric, parseValue } from "./utils.js"
import "./validations/index.js"
import "./re-captcha/index.js"
import "./input-feedback.js"

/**
 * Using validatejs
 *
 * https://validatejs.org/
 */
const _s = {
  el: (formId) => $(formId),
  captchaEl: (name) => name ? $(`div#${name}`) : undefined,
  submitBtn: (context) => $(`button[type="submit"]`, context),
  alertEl: (id) => $(`div[data-alerts-for="${id}"]`),
  loader: (id, context) => $(`div[data-loader="${id}"]`, context),
};

function updateDateTimeValidator(field) {
  validate.extend(validate.validators.datetime, {
    // The value is guaranteed not to be null or undefined but otherwise it
    // could be anything.
    parse: function(value, options) {
      return +dayjs.utc(value, field.data("format"))
    },
    // Input is a unix timestamp
    format: function(value, options) {
      return dayjs.utc(value).format(field.data("format"));
    }
  });
}

/**
 *
 * @param constrains
 * @param beforeSubmit
 * @extends {$}
 * @returns {$}
 */
$.fn.form = function(constrains, beforeSubmit) {
  if (!this) return this;
  if (this.get(0)?.localName !== "form") return this;

  /* if (typeof window.validade !== "function") {
    console.warn("Could not initialize form, validation library not found!", typeof window.validate);
    return;
  } */

  this.attrData = $(this).data()
  this.form = $(this);
  this.id = $(this).attr("id")
  this.silent =  this.attrData.silent;
  this.preventDefault = this.attrData.preventDefault;
  this.needsValidation = this.attrData.needsValidation
  this.captchaName =  this.attrData.captcha
  this.captchaEl = _s.captchaEl(this.captchaName);
  this.captchaId = null;
  this.submitButton = _s.submitBtn(this.form)
  this.alertsEl = _s.alertEl(this.id).alerts()
  this.lastSubmitHtml = null
  this.submitOnChange = this.attrData.submit === "change"

  if (this.needsValidation) {
    this.disable();
  }

  /**
   * Tracks form wisywig editor instances
   * @type {{}}
   */
  this.editors = {}

  /**
   * Tracks form list group instances
   * @type {{}}
   */
  this.lists = {}

  /**
   * Tracks form groups
   * @type {{}}
   */
  this.groups = {}

  /**
   * Tracks form groups
   * @type {{}}
   */
  this.oneToManys = {}

  /**
   * Tracks form groups
   * @type {{}}
   */
  this.dropzones = {}

  this.validated = {}

  this.errors = {}

  this.getEditors = () => Object.keys(this.editors)

  this.getEditor = (name) => this.editors[name]

  this.getDropzones = () => Object.keys(this.dropzones)

  this.getDropzone = (name) => this.dropzones[name]

  this.getLists = () => Object.keys(this.lists)

  this.getList = (name) => this.lists[name]

  this.getGroups = () => Object.keys(this.groups)

  this.getGroup = (name) => this.groups[name]

  this.getOneToManys = () => Object.keys(this.oneToManys)

  this.getOneToMany = (name) => this.oneToManys[name]

  this.refresh = (onDone = () => null) => {
    this.form.off("change submit")

    $(`[data-rich-editor]`, this).each((i, el) => {
      const editorName = $(el).data("rich-editor");

      if (!this.editors[editorName]) {
        this.editors[editorName] = $(el).richEditor()
      }
    })

    $(`div[data-list-group]`, this).each((i, el) => {
      const listName = $(el).data("list-group");

      if (!this.lists[listName]) {
        this.lists[listName] = $(`table`, $(el))
          .table(null, listName)
      }
    })

    $(`div[data-group]`, this).each((i, el) => {
      const groupName = $(el).data("group");

      if (!this.groups[groupName]) {
        this.groups[groupName] = $(`#${groupName}-group`)
      }
    })

    $(`input[data-link-group-autocomplete]`, this).each((i, el) => {
      const groupName = $(el).data("link-group-autocomplete");

      if (!this.oneToManys[groupName]) {
        this.oneToManys[groupName] = $(el).linkTable()
      }
    })

    $(`input[data-dropzone]`, this).each((i, el) => {
      const groupName = $(el).data("dropzone");

      if (!this.dropzones[groupName]) {
        this.dropzones[groupName] = $(el).dropzone()
      }
    })

    $.upload(this)
    // initTooltips()

    this.form.on("change", this.handleOnChange.bind(this))
    this.form.on("submit", this.handleSubmit.bind(this))

    if (typeof onDone === "function") {
      onDone(this)
    }

    return this
  }

  this.updateConstrains = (constrains) => {
    this.constrains = constrains

    this.validated = Object.keys(this.constrains)
      .reduce((obj, key) => {
        obj[key] = false;
        return obj;
      }, {})

    this.updateValidity()

    return this;
  }

  this.loading = (on) => {
    const loader = _s.loader(this.id, this.form);
    return on ? loader.show() : loader.hide();
  };

  this.freeze = () => {
    if(this.silent) return;
    this.lastSubmitHtml = this.submitButton.html()

    this.submitButton
      .render("_spinner", {
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
    const container = field.parents(`div[data-input-container="${field.attr("name")}"]`);
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
    if (!field) return;

    const { validEl, invalidEl } = this.feedbackEl(field)

    field.attr('aria-invalid', !valid);

    if (!valid) {
      this.disable()
      invalidEl.html(message).parent().show()
    } else {
      validEl.html(message).parent().show()
    }
  }

  this.alert = (messages) => {
    if(this.silent) return;

    messages.forEach(
      (message) => $.toast(
        message.level, message.message, 4000, "bottom-left"
      )
    )
  }

  this.validate = async (field) => {
    if (field.attr("type") === "hidden") {
      this.validated[field.attr("name")] = true;
      return;
    };

    if (field.attr("type") === "date" || field.data("input-type") === "date") {
      updateDateTimeValidator(field)
    }

    const isValid = field.get(0).checkValidity();

    field.attr('aria-invalid', !isValid);

    const fieldConstrains = this.constrains[field.attr("name")]
    const data = { [field.attr("name")]: field.val() }
    const filteredConstrais = {
      [field.attr("name")]: this.constrains[field.attr("name")]
    }

    // Add equality input to data and constrains
    if (fieldConstrains && fieldConstrains.equality) {
      const equalityName = fieldConstrains.equality;

      const equalityInput = this.form.find(`[name="${equalityName}"]`)

      if (equalityInput) {
        data[equalityName] = equalityInput.val()
        filteredConstrais[equalityName] = this.constrains[equalityName]
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

    await validate
      .async(data, filteredConstrais, { data: this.data(), form: this.form, field })
      .then(success, error);
  }

  this.validateAll = async (silent) => {
    const validated = Object.keys(this.validated)

    for (let i = 0; i < validated.length; i++) {
      const fieldName = validated[i]
      const field = $(`[name="${fieldName}"]`, this.form)

      if (field.length) {
        this.resetFeedback(field)

        this.validate(field)
          .then(() => {
            if (this.errors[fieldName] && !this.silent && !silent) {
              this.feedback(field, false, this.errors[fieldName].join("<br />"))
            }
          })
      } else {
        this.validated[fieldName] = true
      }
    }
  }

  this.updateValidity = async () => {
    this.validateAll(true)
      .then(() => {
        this.disable(!this.valid())
      })
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

    this.updateConstrains(this.constrains)
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

  const getHeaders = () => {
    const response = { headers: {} }
    const { contentType } = this.attrData

    if (!contentType) {
      response.headers["Content-Type"] = "application/json"
    } else if (contentType !== "multipart/form-data") {
      response.headers["Content-Type"] = contentType
    }

    return response
  }

  this.request = async (url, data) => {
    const method = data.id ? "PATCH" : this.form.attr("method").toUpperCase();
    const params = new URLSearchParams();
    const body = ["POST", "PUT", "PATCH"].indexOf(method) > -1
    const contentType = this.attrData.contentType || "application/json"

    if (method === "GET") {
      Object.keys(data).forEach((key) => {
        params.set(key, data[key])
      })
    }

    const target = params.toString().length > 0 ? url.concat("?", params.toString()) : url

    // await this.delay(2000);

    let payload = ""

    const value = (v) => {
      if (v !== null && v !== undefined) {
        return v
      }
      return ""
    }

    switch(contentType) {
      case "multipart/form-data":
        if (body) {
          payload = new FormData()

          for (const key in data) {
            if (key in this.lists) {
              data[key].forEach((entry, i) => {
                Object.keys(entry).forEach((n) => {
                  payload.append(`${key}[${i}][${n}]`, value(entry[n]))
                })
              })
            } else if(key in this.dropzones) {
              data[key].forEach((file, i) => {
                payload.append(`${key}[]`, value(file.file || ""+file.id))
              })
            } else if (data[key] instanceof FileList) {
              payload.append(key, value(data[key][0]))
            } else {
              payload.append(key, value(data[key]))
            }
          }
        }
        break;
      default:
        payload = body ? JSON.stringify(data) : null
        break;
    }

    return fetch(target, {
      method,
      body: payload,
      ...getHeaders(),
    })
      .then(responseObj => responseObj.json())
      .catch((err)  => {
        console.error(err)

        this.alert([{
          level: "error",
          message: "An unexpected error have acurred while processing your request, please try again later.",
          closable: true
        }])
      })
  }

  this.data = () => {
    const data = this.form.formToObject()

    this.getLists().forEach((listName) => {
      if (this.lists[listName]) {
        data[listName] = this.lists[listName].rows()
      }
    })

    this.getEditors().forEach((editorName) => {
      if (this.editors[editorName]) {
        data[editorName] = this.editors[editorName].editor.getText()
      }
    })

    this.getOneToManys().forEach((oneToManyName) => {
      if (this.oneToManys[oneToManyName]) {
        data[oneToManyName] = this.oneToManys[oneToManyName]?.rows() || []
      }
    })

    this.getDropzones().forEach((dropzoneName) => {
      if (this.dropzones[dropzoneName]) {
        data[dropzoneName] = this.dropzones[dropzoneName]?.getFiles() || []
      }
    })

    /* this.getGroups().forEach((groupName) => {
      const group = this.type?.fields
        .find(field => field.name === groupName)
      if (group) {
        data[group.name] = this.groups[group.id]
      }
    }) */

    if (typeof beforeSubmit === "function") {
      return beforeSubmit(data);
    }

    return data;
  }

  this.setAll = (values, group) => {
    Object.keys(values).forEach(fieldName => {
      const field = group
        ? $(`[name="${fieldName}"]`)
        : $(`[name="${group}[${fieldName}]"]`)

      if ($.utils.isObject(values[fieldName])) {
        this.setAll(values[fieldName], fieldName)
      } else {
        this.set(fieldName, values[fieldName])
      }
    })
  }

  this.set = (name, value) => {
    if (!value && $.utils.isObject(name)) {
      this.setAll(name)
    } else {
      this.form.find(`[name="${name}"]`).val(value)
    }
  }

  this.handleOnChange = async (e) => {
    const field = $(e.target);

    this.resetFeedback(field)

    if (this.needsValidation) {
      await this.validate(field)

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

    if (this.submitOnChange) {
      if (!field.data("ignore-change")) {
        this.form.trigger("submit", { fromChange: {
            name: field.attr("name"),
            value: field.val(),
            valid: this.valid(),
            field
          }})
      }
    } else {
      this.form.trigger("hb-form-changed", {
        name: field.attr("name"),
        value: field.val(),
        valid: this.valid(),
        field
      })
    }
  }

  this.handleSubmit = async (e) => {
    this.loading(true)

    const eventData = {
      id: this.form.attr("id"),
      method: this.form.attr("method").toLowerCase(),
      action: this.form.attr("action"),
      form: this.form,
      data: this.data(),
      fromChange: e.___td?.fromChange
    }

    this.form.trigger("hb-before-submit", eventData)

    if (!this.attrData.ajax) {
      if (this.preventDefault) {
        e.preventDefault()
        this.form.trigger("hb-submit", eventData)
        this.form.trigger("hb-after-submit", eventData)
      }
      return;
    }

    e.preventDefault()

    this.freeze();

    const action = eventData.data.id ? `${eventData.action}/${eventData.data.id}` : eventData.action

    console.log("Submitting", eventData)
    const response = await this.request(
      action,
      eventData.data
    )

    this.alert([{
      level: "success",
      message: this.attrData.successMessage || "Message received!",
      closable: true
    }])

    eventData.response = response;

    if (eventData.method === "POST") {
      this.resetForm()
    }

    this.unfreeze()

    this.loading(false)

    this.form.trigger("hb-after-submit", eventData)
  }

  this.form.on("change", this.handleOnChange.bind(this))
  this.form.on("submit", this.handleSubmit.bind(this))

  this.updateConstrains(constrains)
  this.refresh()

  if (this.needsValidation) {
    this.updateValidity()
  } else {
    this.disable(false)
  }

  this.form.attr("hb-init", "true")

  return this
}
