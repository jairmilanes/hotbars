

export function buildConstrains(fields) {
  const allConstrains = {}
  fields.forEach((field) => {
    const constrains = {}
    const ignore = ["header", "hidden"]

    if (field.required) {
      constrains["presence"] = {
        allowEmpty: false
      }
    } else {
      constrains["presence"] = {
        allowEmpty: true
      }
    }

    switch (field.type) {
      case "url":
        constrains["type"] = 'string'
        constrains["url"] = true
        break;
      case "email":
        constrains["type"] = 'string'
        constrains["email"] = true
        break;
      case "date":
        // constrains["date"] = true
        constrains["format"] = {
          pattern: field["type-date-pattern"],
        }
        break;
      case "credit-card":
        constrains["type"] = "string"
        constrains["format"] = {
          pattern: /^([0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3,4})*$/,
          message: "Must contain letters only."
        }
        break;
      case "alpha":
        constrains["type"] = "string"
        constrains["format"] = {
          pattern: /^[a-zA-Z]*$/,
          message: "must contain letters only."
        }
        break;
      case "alphanumeric":
        constrains["type"] = "string"
        constrains["format"] = {
          pattern: /^[a-zA-Z0-9]*$/,
          message: "must be an alphanumeric."
        }
        break;
      case "text":
      case "textarea":
        constrains["type"] = "string"
        break;
      case "integer":
        constrains["type"] = field.type
        constrains["numericality"] = {
          onlyInteger: true,
          strict: true,
          noStrings: true,
          greaterThanOrEqualTo: field["validate-min"] ? parseInt(field["validate-min"], 10) : undefined,
          lessThanOrEqualTo: field["validate-max"] ? parseInt(field["validate-max"], 10) : undefined,
        }
        break;
      case "currency":
      case "float":
        // constrains["type"] = "number"
        constrains["numericality"] = {
          onlyInteger: false,
          strict: false,
          noStrings: false,
          greaterThanOrEqualTo: field["validate-min"] ? parseInt(field["validate-min"], 10) : undefined,
          lessThanOrEqualTo: field["validate-max"] ? parseInt(field["validate-max"], 10) : undefined,
        }
        break;
      case "phonenumber":
        constrains["type"] = "string"
        if (field["type-phonenumber-pattern"]) {
          constrains["format"] = {
            pattern: new RegExp(field["type-phonenumber-pattern"].replace(/\\\\/g, '\\'))
          }
        }
        break;
      case "cpf":
      case "cnpj":
        constrains["type"] = "string"
        if (field[`type-${field.type}-pattern`]) {
          constrains["format"] = {
            pattern: new RegExp(field[`type-${field.type}-pattern`])
          }
        }
        break;
      case "cpf-cnpj":
        constrains["type"] = "string"
        if (field[`type-${field.type}-pattern`]) {
          constrains["format"] = {
            pattern: new RegExp(field[`type-${field.type}-pattern`])
          }
        }
        break;
      case "zipcode":
        constrains["type"] = "string"
        constrains["format"] = { pattern: /\d{5}(-\d{4})?/}
        break;
      case "pattern":
        constrains["type"] = "string"
        constrains["format"] = { pattern: field["validate-pattern"] }
        break;
      case "toogle":
        constrains["type"] = "boolean"
        break;
      case "dropzone":
        delete constrains["presence"]
        constrains["dropzone"] = {
          maxInput: field[`type-${field.type}-max-input`],
          maxSize: field[`type-${field.type}-max-size`],
          accept: field[`type-${field.type}-accept`],
        }
        break;
      case "upload":
        delete constrains["presence"]
        constrains["upload"] = {
          maxSize: field[`type-${field.type}-max-size`],
          accept: field[`type-${field.type}-accept`],
        }
      default:
        break;
    }

    field.constrains?.forEach((rule) => {
      if (rule.constrain === "min-length" || rule.constrain === "max-length") {
        constrains["length"] = {}
      }

      if (rule.constrain === "min-length") {
        constrains["length"].minimum = parseInt(rule.constrainValue, 10)
      }

      if (rule.constrain === "max-length") {
        constrains["length"].maximum = parseInt(rule.constrainValue, 10)
      }

      if (rule.constrain === "in") {
        constrains["inclusion"] = rule.constrainValue.split(",").map(s => s.trim())
      }

      if (rule.constrain === "not-in") {
        constrains["exclusion"] = rule.constrainValue.split(",").map(s => s.trim())
      }

      if (rule.constrain === "equal-to") {
        constrains["equality"] = rule.constrainValue
      }
    })

    if (Object.keys(constrains).length > 0) {
      allConstrains[field.name] = constrains
    }
  })

  return allConstrains
}