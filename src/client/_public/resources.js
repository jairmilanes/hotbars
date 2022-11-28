ace.config.set(
  "basePath",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.12.5/src-noconflict/"
);

const editor = ace.edit("ace-editor");

editor.setTheme("ace/theme/one_dark");

const editorSession = {
  json: ace.createEditSession("// Enter your json payload", "ace/mode/json"),
  plain: ace.createEditSession(
    "// Enter your plain text payload",
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
  const editors = {
    json: $("#ace-editor"),
    plain: $("#ace-editor"),
    multipart: $("#multipart-editor"),
    binary: $("#binary-editor"),
  };

  /***************************************
   * Resource Tab Controls
   **************************************/
  $("[data-dropdown-trigger]").on("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const trigger = $(e.currentTarget);
    const mode = trigger.data("dropdown-trigger");

    editors[mode].removeClass("hidden");
    editors[mode].siblings().addClass("hidden");

    if (mode in editorSession) {
      editor.setSession(editorSession[mode]);
    }
  });

  /***************************************
   * Multipart Params list
   **************************************/
  const list = $("#hbs-multipart-form-data").list(
    "hbs-mtl-item",
    "_key-value-form-item"
  );

  $("#hbs-multipart-add").on("click", (e) => {
    list.append();
  });

  /***************************************
   * Resource Click event
   **************************************/
  $(".hbs-resource").on("click", (e) => {
    const params = $(".hbs-params", $(e.delegateTarget));
    const method = $(e.delegateTarget).data("method");

    $("#hbs-request-method-none").remove();
    $(".hbs-request-method").addClass("hidden");
    $(`#hbs-request-method-${method}`).removeClass("hidden");

    if (params.length) {
      $("#hbs-request-resource").html(params.html());
    } else {
      $("#hbs-request-resource").html(
        `<span class="font-bold text-slate-600">${$(e.delegateTarget).data(
          "path"
        )}</bold>`
      );
    }

    $("#hbs-request-resource")
      .find("input[type=text]")
      .each((i, input) => {
        $(input).prop("size", 3);

        $(input).on("keyup", () => {
          const len = $(input).val().length;
          if (len <= 3) {
            $(input).prop("size", 3);
          } else {
            $(input).prop("size", len + 0.5);
          }
        });
      });

    const bodyTab = $("#hbs-resource-tabs li:first-child").first();

    if (["get", "delete"].indexOf(method) < 0) {
      bodyTab.removeClass("hidden");
      $("a", bodyTab).first().trigger("click");

      editor.session.setValue(["// Enter your json payload"].join("\n"));
    } else {
      $("#hbs-resource-tabs li a:first-child").eq(1).trigger("click");
      bodyTab.addClass("hidden");
    }
  });

  /***************************************
   * Autogrow resource text input
   **************************************/
});
