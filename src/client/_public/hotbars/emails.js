function EmailPage() {
  this.emails = {
    items: [],
  };
  this.page = 1;
  this.list = $("#hbs-mail-list").list("_mail_list_item");
  this.container = $("#hbs-emails");
  this.message = $("#hbs-no-emails");
  this.preview = $("#hbs-email-preview");
  this.pagination = $("#hbs-email-pages");
  this.header = $("#hbs-email-header");

  this.fetch = async (page = 1) => {
    return fetch(`/_mail?_page=${page}&_sort=id&_order=desc`)
      .then((response) => response.json())
      .then((emails) => {
        this.emails = emails;
        this.page = page;
        this.empty();
        this.paginate();
      });
  };

  this.load = async (page) => {
    return this.fetch(page).then(this.render.bind(this));
  };

  this.paginate = () => {
    if (this.emails.pages >= 1) {
      this.pagination.render("_pagination", this.emails);
    } else {
      this.pagination.html("");
    }
  };

  this.empty = () => {
    if (this.emails.total === 0) {
      this.container.removeClass("hidden").hide();
      this.message.removeClass("hidden").show();
    } else {
      this.container.removeClass("hidden").show();
      this.message.removeClass("hidden").hide();
    }
  };

  this.loading = (on) => {
    const loader = $("#hbs-emails-loading");
    return on ? loader.show() : loader.hide();
  };

  this.remove = async (id) => {
    return fetch(`/_mail/${id}`, { method: "delete" }).then((response) =>
      response.json()
    );
  };

  this.render = () => {
    this.loading(false);

    this.list.reset();

    const { items } = this.emails;

    items.forEach((email) =>
      this.list.appendItem({
        ...email,
        date: dayjs(email.date).fromNow(),
        dateString: dayjs(email.date).format("DD/MM/YYYY HH:mm:ss")
      })
    );
  };

  this.setHeader = (email) => {
    this.header.render("_mail_item_header", {
      ...email,
      headerHeaders: ["name", "value"],
      headerLines: email.headerLines.map((header) => ({
        name: header.key,
        value: header.line,
      })),
      date: dayjs(email.date).fromNow(),
    });
  };

  this.open = (email) => {
    this.preview
      .data("selected", email.id)
      .attr("src", `/_mail/render/${email.id}`);

    this.setHeader(email);
  };

  this.list.on("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const link = $(e.target).closest("a");

    if (link && link.data("name") === "email") {
      const email = this.emails.items.find(
        (email) => email.id === link.data("id")
      );

      this.open(email);
    }
  });

  this.pagination.on("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const btn = $(e.target).closest("button");

    if (btn && btn.data("page")) {
      const page = parseInt(btn.data("page"), 10);
      $.pushState({ page, test: undefined });
    }
  });

  this.header.on("click", async (e) => {
    const btn = $(e.target).closest("button");

    if (btn && btn.attr("id") === "hbs-remove-email") {
      const id = $("#hbs-email-preview").data("selected");

      const context = {
        id: "delete-confirm-modal",
        message: "Are you sure you want to delete this email?",
      };

      $("body").confirm("_confirm-modal", context, async (modal) => {
        await this.remove(id);
        await this.load(this.page);

        this.list.removeItem(id).click(0);

        modal.remove();
      });
    }
  });

  this.load($.query().get("page") || 1).then(() => this.list.click(0));

  $.stateChange((params) => {
    this.load(params.get("page") || 1);
  });
}

$(() => new EmailPage());
