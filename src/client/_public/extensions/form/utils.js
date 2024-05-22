export function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

export function parseValue(value) {
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