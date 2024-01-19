
class MultipartView {
  el = $("#multipart-editor");
  addEl = $("#hb-multipart-add");
  list = $("#hbs-multipart-form-data").list(
    "_key-value-form-item"
  );

  constructor() {
    $.subscribe("hb-enable-multipart-editor", (e) => {
      this.el.show()
    })

    $.subscribe("hb-disable-all-editors", (e) => {
      this.el.hide()
    })

    this.addEl.on("click", () => {
      this.list.appendItem({});
    });

    this.addEl.trigger("click")
  }

}

class EditorView {
  id = null
  el = null;

  constructor(id, mode) {
    this.id = id
    this.el = $(`#${this.id}`).aceEditor(mode);

    $.subscribe("hb-reset-editor", this.reset.bind(this))

    $.subscribe("hb-enable-json-editor", (e) => {
      this.el.show()
      this.el.switchSession(mode);
    })

    $.subscribe("hb-enable-plain-editor", (e) => {
      this.el.show()
      this.el.switchSession(mode);
    })

    $.subscribe("hb-disable-all-editors", (e) => {
      this.el.hide()
    })
  }

  reset = (e) => {
    if (e.mode === "json") {
      this.el.setValue(["{", "    ", "}"].join("\n"));
      this.el.editor.moveCursorTo(1, 5);
    }

    if (e.mode === "plain") {
      this.el.setValue("");
      this.el.editor.moveCursorTo(0, 0);
    }

    setTimeout(() => {
      this.el.editor.focus();
    }, 100)
  }
}

class BinaryView {
  el = $("#binary-editor");
  form = $("form", this.el)
  dropzone = $(`label[for="dropzone-file"]`, this.el)
  files = $("#drozone-file-list", this.el).list("_dropzone-file")

  constructor() {
    this.form.form({})
    console.log("FORM", this.form)
    $.subscribe("hb-enable-binary-editor", (e) => {
      this.el.show()
    })

    $.subscribe("hb-disable-all-editors", (e) => {
      this.el.hide()
    })

    this.form.on("hb-form-changed", (e) => {
      console.log("hb-form-changed", this.form.data())
    })
  }
}

class EmptyView {
  el = $("#hbs-empty-content")

  constructor() {
    $.subscribe("hb-no-content", () => {
      this.el.show()
    })

    $.subscribe("hb-disable-all-editors", (e) => {
      this.el.show()
    })

    $.subscribe("hb-enable-binary-editor", () => this.el.hide())
    $.subscribe("hb-enable-multipart-editor", () => this.el.hide())
    $.subscribe("hb-enable-json-editor", () => this.el.hide())
    $.subscribe("hb-enable-plain-editor", () => this.el.hide())
  }
}

class StatusView {
  status = {
    el: $("#hbs-status"),
    label: $("#hbs-status-label"),
    code: $("#hbs-status-code"),
    text: $("#hbs-status-text")
  }

  constructor() {
    $.subscribe("hb-update-status", this.update.bind(this))
  }

  inRange = (number, start, end) => {
    return number >= start && number <= end;
  }

  update = (e) => {
    const {code, text} = e

    if (!code || !text) {
      this.status.code.html("")
      this.status.text.html("")
      this.status.el.addClass("hidden");
      return;
    }

    this.status.el.removeClass("hidden");
    this.status.code.html(code)
    this.status.text.html(text)

    const colors = ["blue", "green", "orange", "red", "gray"];

    colors.forEach(color =>
      this.status.el.removeClass(`bg-${color}-600`)
    );

    if (this.inRange(code, 100, 199)) {
      this.status.el.addClass(`bg-gray-600`)
    }

    if (this.inRange(code, 200, 299)) {
      this.status.el.addClass(`bg-green-600`)
    }

    if (this.inRange(code, 300, 399)) {
      this.status.el.addClass(`bg-orange-600`)
    }

    if (this.inRange(code, 400, 499)) {
      this.status.el.addClass(`bg-orange-600`)
    }

    if (this.inRange(code, 500, 599)) {
      this.status.el.addClass(`bg-red-600`)
    }
  }
}

class RequestHeadersView {
  el = $("#hbs-headers-content")

  constructor() {
    $.subscribe("hb-render-headers", this.render.bind(this))
  }

  render({ html }) {
    this.el.render("_resource-headers", { headers: html })
  }
}

class PreviewView {
  el = $("#hbs-preview-content")

  constructor() {
    $.subscribe("hb-render-preview", this.render.bind(this))
  }

  render({ html }) {
    $("code", this.el).html(html)
  }
}

class ResponseView {
  el = $("#hbs-response-content")

  constructor() {
    $.subscribe("hb-render-response", this.render.bind(this))
  }

  render({ html }) {
    $("code", this.el).html(html)
  }
}

class Header {
  context = {}
  container = $("#hb-resource-header")
  sendEl = $("#hb-send-request", this.container).button();
  resourceEl = $("#hbs-request-resource", this.container);
  resourceTabsEl = $("#hbs-resource-tabs", this.container);

  tabs = {
    body: $("#hbs-body-content-tab", this.container),
    response: $("#hbs-response-content-tab", this.container),
    preview: $("#hbs-preview-content-tab", this.container)
  }

  constructor() {
    this.sendEl.on("click", this.handleSend.bind(this));

    $.subscribe("hb-update-method", this.changeMethod.bind(this))

    $.subscribe("hb-resource-selected", (e) => {
      this.context.url = e.url
      this.context.method = e.method

      const params = $(".hbs-params", e.active)
      const urlPathHtml = `<span class="font-bold text-slate-600">${e.url}</bold>`

      this.resourceEl.html(
        params.length ? params.html() : urlPathHtml
      )

      this.attachResizeEvent()
      this.toggleBodyTab()

      this.sendEl.disable(false);
    })

    $.subscribe("hb-change-tab", ({ id }) => {
      if (id in this.tabs) {
        this.tabs[id].trigger("click");
      }
    })
  }

  changeMethod({ method }){
    $("#hbs-request-method-none").remove();
    $(".hbs-request-method").addClass("hidden");
    $(`#hbs-request-method-${method}`).removeClass("hidden");
    this.context.method = method
  }

  toggleBodyTab() {
    const bodyTab = $("li:first-child", this.resourceTabsEl).first();

    if (["get", "delete"].indexOf(this.context.method) < 0) {
      bodyTab.removeClass("hidden");
      $("a", bodyTab).first().trigger("click");

      $.dispatch("hb-reset-editor", { mode: "json" })
    } else {
      $("#hbs-resource-tabs li a:first-child").eq(1).trigger("click");
      bodyTab.addClass("hidden");
    }
  }

  attachResizeEvent() {
    this.resourceEl
      .find("input[type=text]")
      .each((i, input) => {
        const el = $(input)

        el.prop("size", 3);

        el.on("keyup", () => {
          const len = el.val().length;

          if (len <= 3) {
            el.prop("size", 3);
          } else {
            el.prop("size", len + 0.5);
          }
        });
      });
  }

  loading(is) {
    if (typeof is === "boolean") {
      this.sendEl.loading(is)
    } else {
      this.sendEl.loading()
    }
  }

  traspileUrl() {
    let url = this.context.url;

    this.resourceEl
      .find("input")
      .each((i, input) => {
        const { name } = input;
        url = url.replace(`:${name}`, input.value);
      })

    return url
  }

  getHeaders(response) {
    const headers = [];

    for (const pair of response.headers.entries()) {
      headers.push({
        name: pair[0],
        value: pair[1]
      });
    }

    return headers
  }

  handleSend() {
      this.loading(true);

      if (this.context.url) {
        fetch(this.traspileUrl(), {
          method: this.context.method,
          body: ["post", "patch", "put"].indexOf(this.context.method) > -1 ?
            editor.getValue() : null,
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          }
        })
          .then((response) => {
            this.context.status = response.status;
            $.dispatch("hb-update-status", { code: response.status, text: response.statusText });
            $.dispatch("hb-render-headers", { html: this.getHeaders(response) })
            return response.json();
          })
          .then((data) => {
            $.dispatch("hb-render-response", { html: JSON.stringify(data) })
            $.dispatch("hb-render-preview", { html: JSON.stringify(data, null, 4).trim() })
            $.dispatch("hb-change-tab", { id: "response" })

            this.loading(false);
          })
          .catch(e => {
            this.loading(false);
          });
      }
  }
}

class ResourcesList {
  context = {}
  resources = $(".hbs-resource")

  constructor() {
    this.resources.on("click", this.handleClick.bind(this))
  }

  clearContent() {
    $.dispatch("hb-render-headers", { html: "" })
    $.dispatch("hb-render-preview", { html: "" })
    $.dispatch("hb-render-response", { html: "" })
  }

  handleClick(e) {
    this.clearContent();

    this.context.active = $(e.delegateTarget)
    this.context.method = this.context.active.data("method");
    this.context.url = this.context.active.data("path");

    $.dispatch("hb-update-method", { method: this.context.method })
    $.dispatch("hb-update-status", { code: "", text: "" });
    $.dispatch("hb-resource-selected", {
      ...this.context,
      active: this.context.active
    });

    if (["post", "patch", "put"].indexOf(this.context.method) > -1) {
      $.dispatch("hb-change-tab", { id: "body" })
    } else {
      $.dispatch("hb-change-tab", { id: "response" })
    }

    // Enable the send button if request does not require a payload
    if (["post", "patch", "put"].indexOf(this.context.method) < 0) {
      // this.sendRequestEl.removeAttr("disabled");
    }

    setTimeout(() => {
      Prism.highlightAll()
    }, 2000)
  }
}

class Page {

  header = new Header()
  resources = new ResourcesList()

  status = new StatusView()

  editors = {
    json: new EditorView("json-editor", "json"),
    plain: new EditorView("plain-editor", "plain"),
    multipart: new MultipartView(),
    binary: new BinaryView(),
    empty: new EmptyView()
  }

  views = {
    headers: new RequestHeadersView(),
    response: new ResponseView(),
    preview: new PreviewView()

  }
  bodyDropdownTrigger = $("[data-dropdown-trigger]");

  clearContent = () => {
    $.dispatch("hb-render-headers", { html: "" })
    $.dispatch("hb-render-preview", { html: "" })
    $.dispatch("hb-render-response", { html: "" })
  }

  constructor() {
    this.bodyDropdownTrigger.on("click", this.updateBodyMode.bind(this))
  }

  updateBodyMode(e) {
    e.preventDefault();

    const trigger = $(e.currentTarget);
    const mode = trigger.data("dropdown-trigger");

    $.dispatch("hb-disable-all-editors")
    $.dispatch(`hb-enable-${mode}-editor`)
    $.dispatch(`hb-reset-editor`, { mode })

    // $("[data-dropdown-trigger=json]").text()
    // $("[data-dropdown-toggle=hbs-dropdown-body]").trigger("click")
  }
}
/*
function ResourcesPage() {
  const context = {};
  this.aceEditorEl = $("#ace-editor").aceEditor("plain").addSession("json");
  this.mulripartEditorEl = $("#multipart-editor");
  this.binaryEditorEl = $("#binary-editor");

  this.resourceListItemEl = $(".hbs-resource");

  this.bodyDropdownTrigger = $("[data-dropdown-trigger]");
  this.multipartAddEl = $("#hbs-multipart-add");

  this.resourceEl = $("#hbs-request-resource");
  this.resourceTabsEl = $("#hbs-resource-tabs");
  this.sendRequestEl = $("#hbs-send-request");

  this.responseContentEl = $("#hbs-response-content");
  this.previewContentEl = $("#hbs-preview-content");
  this.headersContentEl = $("#hbs-headers-content");

  this.tabs = {
    body: $("#hbs-body-content-tab"),
    response: $("#hbs-response-content-tab"),
    preview: $("#hbs-preview-content-tab")
  }

  this.emptyContentEl = $("#hbs-empty-content");

  this.activeResource = null;

  this.status = new StatusView()

  const editors = {
    json: this.aceEditorEl,
    plain: this.aceEditorEl,
    multipart: this.mulripartEditorEl,
    binary: this.binaryEditorEl,
  };

  this.multipartList = $("#hbs-multipart-form-data").list(
    "hbs-mtl-item",
    "_key-value-form-item"
  );

  this.changeRequestMethod = (method) => {
    $("#hbs-request-method-none").remove();
    $(".hbs-request-method").addClass("hidden");
    $(`#hbs-request-method-${method}`).removeClass("hidden");
  }

  this.attachResizeEvent = () => {
    this.resourceEl
      .find("input[type=text]")
      .each((i, input) => {
        const el = $(input)
        el.prop("size", 3);

        el.on("keyup", () => {
          const len = el.val().length;
          if (len <= 3) {
            el.prop("size", 3);
          } else {
            el.prop("size", len + 0.5);
          }
        });
      });
  }

  this.toggleBodyTab = () => {
    const bodyTab = $("li:first-child", this.resourceTabsEl).first();

    if (["get", "delete"].indexOf(context.method) < 0) {
      bodyTab.removeClass("hidden");
      $("a", bodyTab).first().trigger("click");

      this.resetEditor("json")
    } else {
      $("#hbs-resource-tabs li a:first-child").eq(1).trigger("click");
      bodyTab.addClass("hidden");
    }
  }

  this.loading = (is) => {
    const sendBtn = $("#send-btn");
    const sendingBtn = $("#sending-btn");
    const loading = $("#loading");

    if (typeof is === "boolean") {
      if (is) {
        loading.removeClass("hidden")
        sendBtn.addClass("hidden")
        sendingBtn.removeClass("hidden")
      } else {
        loading.addClass("hidden")
        sendingBtn.addClass("hidden")
        sendBtn.removeClass("hidden")
      }
    } else {
      if (loading.hasClass("hidden")) {
        loading.removeClass("hidden")
        sendingBtn.removeClass("hidden")
        sendBtn.addClass("hidden")
      } else {
        loading.addClass("hidden")
        sendingBtn.addClass("hidden")
        sendBtn.removeClass("hidden")
      }
    }
  }

  this.clearContent = () => {
    $("code", this.responseContentEl).html("");
    $("code", this.previewContentEl).html("");
    $("code", this.headersContentEl).html("");
  }

  this.resetEditor = (mode) => {
    if (mode === "json") {
      this.aceEditorEl.setValue(["{", "    ", "}"].join("\n"));
      this.aceEditorEl.editor.moveCursorTo(1, 5);
    }
    setTimeout(() => {
      this.aceEditorEl.editor.focus();
    }, 100)
  }

  this.bodyDropdownTrigger.on("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const trigger = $(e.currentTarget);
    const mode = trigger.data("dropdown-trigger");

    editors[mode].removeClass("hidden");
    editors[mode].siblings().addClass("hidden");

    if (this.aceEditorEl.session(mode)) {
      this.aceEditorEl.switchSession(mode);
    }

    $("[data-dropdown-trigger=json]").text()
    $("[data-dropdown-toggle=hbs-dropdown-body]").trigger("click")

    this.resetEditor("json")
  });


  this.multipartAddEl.on("click", () => {
    this.multipartList.append();
  });

  $("button", this.resourceTabsEl).on("click", () => {
    this.emptyContentEl.addClass("hidden")
  })


  this.resourceListItemEl.on("click", (e) => {
    this.activeResource = $(e.delegateTarget)
    const params = $(".hbs-params", this.activeResource);
    this.clearContent();

    context.method = this.activeResource.data("method");
    context.url = this.activeResource.data("path");

    this.changeRequestMethod(context.method);

    const urlPathHtml = `<span class="font-bold text-slate-600">${context.url}</bold>`;

    this.resourceEl.html(
      params.length ? params.html() : urlPathHtml
    );

    this.attachResizeEvent();
    this.toggleBodyTab();

    $.dispatch("hb-update-status", { code: "", text: "" });

    if (["post", "put", "patch"].indexOf(context.method) > -1) {
      this.tabs.body.trigger("click");
    } else {
      this.tabs.response.trigger("click")
    }

    // Enable the send button if request does not require a payload
    if (["post", "patch", "put"].indexOf(context.method) < 0) {
      this.sendRequestEl.removeAttr("disabled");
    }

    setTimeout(() => {
      Prism.highlightAll()
    }, 2000)
  });

  this.sendRequestEl.on("click", () => {
    this.loading(true);

    if (context.url) {
      let url = context.url;

      this.resourceEl.find("input")
        .each((i, input) => {
          const { name } = input;
          url = url.replace(`:${name}`, input.value);
        })

      fetch(url, {
        method: context.method,
        body: ["post", "patch", "put"].indexOf(context.method) > -1 ?
          editor.getValue() : null,
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        }
      })
        .then((response) => {
          context.status = response.status;

          $.dispatch("hb-update-status", { code: response.status, text: response.statusText });

          const headers = [];

          for (const pair of response.headers.entries()) {
            headers.push({
              name: pair[0],
              value: pair[1]
            });
          }

          this.headersContentEl.render("_resource-headers", { headers });

          return response.json();
        })
        .then((data) => {
          $("code", this.responseContentEl).html(
            JSON.stringify(data)
          );

          $("code", this.previewContentEl).html(
            JSON.stringify(data, null, 4).trim()
          )

          this.loading(false);

          $("#hbs-response-content-tab").trigger("click")
        })
        .catch(e => {
          this.loading(false);
        });
    }
  });
} */

$(() => new Page());
