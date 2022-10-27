(function () {
  var template = Handlebars.template,
    templates = (Handlebars.templates = Handlebars.templates || {});
  templates["address"] = template({
    compiler: [8, ">= 4.3.0"],
    main: function (container, depth0, helpers, partials, data) {
      var stack1,
        alias1 = container.lambda,
        alias2 = container.escapeExpression,
        lookupProperty =
          container.lookupProperty ||
          function (parent, propertyName) {
            if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
              return parent[propertyName];
            }
            return undefined;
          };

      return (
        '<div class="ex-user-address">\r\n  <p>' +
        alias2(
          alias1(
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "user") : depth0) != null
              ? lookupProperty(stack1, "streetAddress")
              : stack1,
            depth0
          )
        ) +
        "</p>\r\n  <p>" +
        alias2(
          alias1(
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "user") : depth0) != null
              ? lookupProperty(stack1, "city")
              : stack1,
            depth0
          )
        ) +
        "</p>\r\n</div>"
      );
    },
    useData: true,
  });
  templates["user"] = template({
    compiler: [8, ">= 4.3.0"],
    main: function (container, depth0, helpers, partials, data) {
      var stack1,
        alias1 = container.lambda,
        alias2 = container.escapeExpression,
        lookupProperty =
          container.lookupProperty ||
          function (parent, propertyName) {
            if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
              return parent[propertyName];
            }
            return undefined;
          };

      return (
        '<div class="ex-user-header">\r\n  <h3>' +
        alias2(
          alias1(
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "user") : depth0) != null
              ? lookupProperty(stack1, "name")
              : stack1,
            depth0
          )
        ) +
        "</h3>\r\n  <h3>" +
        alias2(
          alias1(
            (stack1 =
              depth0 != null ? lookupProperty(depth0, "user") : depth0) != null
              ? lookupProperty(stack1, "lastname")
              : stack1,
            depth0
          )
        ) +
        "</h3>\r\n</div>"
      );
    },
    useData: true,
  });
})();
