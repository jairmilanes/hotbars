ace.config.set(
  "basePath",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.12.5/src-noconflict/"
);

const editor = ace.edit("ace-editor");

editor.setTheme("ace/theme/one_dark");

const editorSession = {
  json: ace.createEditSession(
    ["{", "    ", "}"].join("\n"),
    "ace/mode/json"
  ),
  plain: ace.createEditSession(
    "",
    "ace/mode/text"
  ),
};

Object.keys(editorSession).forEach((mode) => {
  editorSession[mode].setTabSize(4);
  editorSession[mode].setUseSoftTabs(true);
  editorSession[mode].setUseWrapMode(true);
});

editor.setSession(editorSession.json);

$(function () {
  const context = {};

  this.aceEditorEl = $("#ace-editor");
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
  this.status = {
    el: $("#hbs-status"),
    label: $("#hbs-status-label"),
    code: $("#hbs-status-code"),
    text: $("#hbs-status-text")
  }

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

  /***************************************
   * Autogrow resource text input
   **************************************/
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

      editor.session.setValue(["{", "    ", "}"].join("\n"));
      editor.moveCursorTo(1, 5);
      setTimeout(() => {
        editor.focus();
      }, 100)
    } else {
      $("#hbs-resource-tabs li a:first-child").eq(1).trigger("click");
      bodyTab.addClass("hidden");
    }

    console.log(editor);
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

  this.inRange = (number, start, end) => {
    return number >= start && number <= end;
  }

  this.updateStatus = (code, text) => {
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

  /***************************************
   * Change body editor event
   **************************************/
  this.bodyDropdownTrigger.on("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const trigger = $(e.currentTarget);
    const mode = trigger.data("dropdown-trigger");

    editors[mode].removeClass("hidden");
    editors[mode].siblings().addClass("hidden");

    if (mode in editorSession) {
      editor.setSession(editorSession[mode]);
    }

    $("[data-dropdown-trigger=json]").text()
    $("[data-dropdown-toggle=hbs-dropdown-body]").trigger("click")

    if (mode === "json") {
      editor.session.setValue(["{", "    ", "}"].join("\n"));
      editor.moveCursorTo(1, 5);
    }

    setTimeout(() => {
      editor.focus();
    }, 100)
  });

  /***************************************
   * Multipart Params list
   **************************************/
  this.multipartAddEl.on("click", () => {
    this.multipartList.append();
  });

  $("button", this.resourceTabsEl).on("click", () => {
    this.emptyContentEl.addClass("hidden")
  })

  /***************************************
   * Resource Click event
   **************************************/
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
    this.updateStatus("", "");

    if (["post", "put", "patch"].indexOf(context.method) > -1) {
      this.tabs.body.trigger("click");
    } else {
      this.tabs.response.trigger("click")
    }

    // Enable the send button if request does not require a payload
    if (["post", "patch", "put"].indexOf(context.method) < 0) {
      this.sendRequestEl.attr("disabled", false);
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

          this.updateStatus(response.status, response.statusText);

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
});
