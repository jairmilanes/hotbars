


export class Formats {

  static phone = [
    /* { label: "+1 (647) 394-7266", value: "/^+1 \(\d{2,3}\) \d{3,4}-\d{4}/" },
    { label: "(647) 394-7266", value: `/^\(\d{3}\) \d{3}-\d{4}/` },
    { label: "(64) 7394-7266", value: `/^\(\d{2}\) \d{4}-\d{4}/` }, */
    { label: "+1 (647) 394-7266", value: "+0 (000) 000-0000", pattern: "^(+\\d+\\s\\(\\d{2,3}\)\\s\\d{3,4}-\\d{4})?$" },
    { label: "(647) 394-7266", value: `(000) 000-0000`, pattern: "^(\\(\\d{3}\\)\\s\\d{3}-\\d{4})?$" },
    { label: "(64) 7394-7266", value: `(00) 000[0]-0000`, pattern: "^(\\(\\d{2}\\)\\s\\d{3,4}-\\d{4})?$" },
  ]

  static date = [
    { label: "dd/mm/YYYY", value: "DD/MM/YYYY", pattern: "^(\\d{2}\/\\d{2}\/\\d{4})?$", mask: "00/00/0000" },
    { label: "dd-mm-YYYY", value: "DD-MM-YYYY", pattern: "^(\\d{2}-\\d{2}-\\d{4})?$", mask: "00-00-0000" },
    // { label: "Localized", value: "LL", pattern: "^[a-zA-z]+\\s\\d{2},\\s\\d{4}$", mask: "00-00-0000" },
  ]

  static zip = [
    { label: "00000", value: "00000", pattern: "^\\d{5}?$" },
    { label: "00000-0000", value: "00000-0000", pattern: "^(\\d{5}-\\d{4})?$" },
    { label: "00000-000", value: "00000-000", pattern: "^(\\d{5}-\\d{3})?$" },
    { label: "000-000", value: "000-000", pattern: "^(\\d{3}-\\d{3})?$" },
  ]

  static other = {
    alpha: {
      pattern: "^[a-zA-Z]+$"
    },
    alphanumeric: {
      pattern: "^[a-zA-Z0-9]+$"
    },
    cpfCnpj: {
      pattern: "^(\\d{2}\\.?\\d{3}\\.?\\d{3}\/?\\d{4}-?\\d{2})?$",
      format: "[0]00.000.000[/][0][0][0][0]-00"
    },
    cpf: {
      pattern: "^(\\d{2,3}\\.\\d{3}\\.\\d{3}-\\d{1,2})?$",
      format: "00.000.000-00"
    },
    cnpj: {
      pattern: "^(\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2})?$",
      format: "00.000.000/0000-00"
    },
    creditCard: {
      pattern: "^(\\d{4}-\\d{4}-\\d{4}-\\d{3,4})?$",
      format: "0000-0000-0000-000[0]"
    },
    zip: {
      pattern: "^(\\d{5}(-\\d{4})?)?$",
      format: "00000[-0000]"
    },
  }

  init(form, context) {
    this.attacheFormatChange("phonenumber", Formats.phone)
    this.attacheFormatChange("date", Formats.date)
    this.attacheFormatChange("zip", Formats.zip)
    return context
  }

  attacheFormatChange(type, collection) {
    $(`select[name=type-${type}-format]`)
      .on("change", (e) => {
        const format = collection?.find(format => format.value === e.target.value)

        if (format) {
          $(`input[name=type-${type}-pattern]`).val(format.pattern)
          $(`input[name=type-${type}-mask]`).val(format.mask)
        }
      })
  }
}