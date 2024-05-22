import "./form.js"

const _s = {
  form: (context) => $(`form[auto-init="true"]:not([hb-init="true"])`),
};

function parseValidations(inputName, data, constrains) {
  Object.keys(data).forEach(
    (name) => {
      const value = data[key]

      if (name.startsWith("validate-")) {
        if (!constrains[inputName]) {
          constrains[inputName] = { type: input.attr("type") };
        }
        const constrain = name.replace("validate-", "");
        const constrainValue = parseValue(value)
        const config = {}

        Array.from(elem.attributes).forEach(({ name, value }) => {
          if (name.startsWith(`${constrain}-`)) {
            config[name.replace(`${constrain}-`, "")] = constrainValue
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
}

function init(context) {
  _s.form(context).each((i, form) => {
    const constrains = {}

    $("input, textarea, select", $(form))
      .each((i, elem) => {
        const input = $(elem)
        const inputName = input.attr("name")
        const data = elem.data()
        parseValidations(inputName, data, constrains)
      })

    $(form).form(constrains)
  })
}

$(() => {
  $.forms = init
  init();
})