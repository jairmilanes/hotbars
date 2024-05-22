export default function(originalValue, options, key, allValues, global) {
  return new Promise((resolve, reject) => {
    const { [key]: value } = originalValue

    const { field, data } = global
    // console.log("--- FIELD", key, field)

    if (!data?.[key]) {
      // console.log("*** NO DATA", key, data)

      if (field.data("file-id") === data?.[key]) {
        // console.log("*** HAS FILE ID", field.data("file-id"), data?.[key])
        return resolve()
      }

      if (!field.prop("required")) {
        return resolve("must not be empty")
      }

      return resolve()
    }

    const files = Array.from(data?.[key]);
    // console.log("--- FILES", files)


    if (!Array.isArray(files)) {
      if (!field.prop("required")) {
        return resolve("must not be empty")
      }

      // console.log("*** NOT ARRAY", files)
      return resolve()
    }

    if (!files.length) {
      if (field.data("file-id") === data?.[key]) {
        // console.log("*** HAS FILE ID", field.data("file-id"), data?.[key])
        return resolve()
      }

      if (field.prop("required")) {
        // console.log("*** IS REQUIRED", attributes)
        return resolve(`must not be empty`)
      }
    }

    if (files.length > 1) {
      // console.log("*** TOO MANY", files.length)
      return resolve("has too many files")
    }

    if (files[0].size > parseInt(options.maxSize, 10)) {
      // console.log("*** TOO BIG", files[0].size, parseInt(options.maxSize, 10))
      return resolve("Some files are too large.")
    }

    // console.log("*** ALL GOOD!")
    resolve()
  });
}