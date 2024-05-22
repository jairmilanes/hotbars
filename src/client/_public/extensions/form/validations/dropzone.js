export default function(value, options, key, attributes, global) {
  return new validate.Promise(function(resolve, reject) {
    const { form, field, data } = global

    if (!data?.[key]) {
      if (!field.prop("required")) {
        return resolve("must not be empty")
      }

      return resolve()
    }

    const files = Array.from(global.data?.[key]);

    if (!Array.isArray(files)) {
      if (!field.prop("required")) {
        return resolve("must not be empty")
      }

      return resolve()
    }

    if (!files.length) {
      if (!field.prop("required")) {
        return resolve("must not be empty")
      }

      return resolve(`${key} is required`)
    }

    if (files.length > parseInt(options.maxInput, 10)) {
      return resolve("has too many files")
    }

    const largeFiles = []
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > parseInt(options.maxSize, 10)) {
        largeFiles.push(files[i])
      }
    }
    if (largeFiles.length) {
      return resolve([
        `files exceed size limit of ${$.utils.bytesToSize(options.maxSize)}.`,
        ...largeFiles.map(file => `^File: ${file.name}`)
      ])
    }

    resolve()
  });
}
