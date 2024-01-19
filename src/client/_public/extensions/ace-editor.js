
const merge = (obj1, obj2) => {
  const merged = {}
  Object.keys(obj1).forEach(key => {
    if (obj1[key] !== null && typeof obj1[key] === "object") {
      merged[key] = merge(obj1[key], obj2[key])
    } else {
      merged[key] = obj2 && key in obj2 ? obj2[key] : obj1[key]
    }
  })
  return merged;
}

$.fn.aceEditor = function(defaultMode, options = {}) {
  ace.config.set(
    "basePath",
    "https://cdn.jsdelivr.net/npm/ace-builds@1.12.5/src-noconflict/"
  );

  this.editor = ace.edit(this.attr("id"))
  this.editor.setTheme("ace/theme/one_dark")

  this.sessions = {}
  this.activeSession = null

  this.options = merge({
    tabSize: 4,
    useSoftTabs: false,
    useWrapMode: false,
    editorOptions: {
      fontFamily: "Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace",
      fontSize: "12pt"
    },
  }, options)

  this.session = (mode) => {
    if (mode) return this.sessions[mode]
    return this.sessions[this.activeSession]
  }

  this.addSession = (mode) => {
    switch(mode) {
      case "json":
        this.sessions.json = ace.createEditSession(
          ["{", "    ", "}"].join("\n"),
          "ace/mode/json"
        )
      default:
        this.sessions.plain = ace.createEditSession(
          "",
          "ace/mode/text"
        )
    }

    Object.keys(this.options)
      .forEach((key) => {
        if (key !== "editorOptions") {
          const method = `set${key.slice(0, 1).toUpperCase()}${key.slice(1)}`
          if (typeof this.sessions[mode][method] === "function") {
            this.sessions[mode][method](options[key])
          }
        }
      })

    this.editor.setOptions(this.options.editorOptions);
    this.editor.setSession(this.sessions[mode])
    this.activeSession = mode;

    return this;
  }

  this.switchSession = (mode) => {
    this.editor.setSession(this.sessions[mode])

    this.activeSession = mode;

    return this;
  }

  this.setValue = (value) => {

    console.log("this.aceEditorEl", this.activeSession, this.session())
    this.session().setValue(value);
  }

  this.getValue = () => {
    return this.editor.getValue()
  }

  return this.addSession(defaultMode)
}