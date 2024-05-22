/// <reference types="cypress" />


context('Alert Message', () => {
  beforeEach(() => {})

  const context = {
    id: "my-alert"
  }
  const load = (ctx) => {
    cy.visitPartial("_alert-message", ctx)
  }

  it("Should render", () => {
    const thisCtx = {
      ...context,
      title: "A alert!!",
      message: "This is an alert message.",
      style: "rounded",
      icon: "check",
      closable: true
    }

    load(thisCtx)

    cy.get(`#${context.id}`)
      .find("h2")
      .should("have.text", thisCtx.title)

    cy.get(`#${context.id}`)
      .find("p")
      .should("have.text", thisCtx.message)
  })

  it("Should close", () => {
    const thisCtx = {
      ...context,
      title: "A alert!!",
      closable: true
    }

    load(thisCtx)

    cy.window()
      .then(($win) => {
        $win.$.dismiss()

        const btn = cy
          .get(`#${context.id}`)
          .find("button[data-dismiss]")

        cy.get(`#${context.id}`).should("exist")

        btn.click()

        cy.wait(1000)

        cy.get(`#${context.id}`).should("not.exist")
      })
  })

  it("Should display message only", () => {
    const thisCtx = {
      ...context,
      message: "This is an alert message."
    }

    load(thisCtx)

    cy.get(`#${context.id}`)
      .find("h2")
      .should("not.exist")

    cy.get(`#${context.id}`)
      .find("p")
      .should("have.text", thisCtx.message)
  })

  it("Should display title only", () => {
    const thisCtx = {
      ...context,
      title: "A alert!!",
    }

    load(thisCtx)

    cy.get(`#${context.id}`)
      .find("h2")
      .should("have.text", thisCtx.title)

    cy.get(`#${context.id}`)
      .find("p")
      .should("not.exist")
  })

  it("Should display icon", () => {
    const thisCtx = {
      ...context,
      title: "A alert!!",
      message: "This is an alert message.",
      icon: "check"
    }

    load(thisCtx)

    cy.get(`#${context.id}`)
      .find("span.material-symbols-outlined")
      .should("have.text", thisCtx.icon)
  })

  it("Should use column layout", () => {
    const thisCtx = {
      ...context,
      title: "A alert!!",
      message: "This is an alert message.",
      icon: "error",
      layout: "col",
      level: "error"
    }

    load(thisCtx)

    cy.get(`#${context.id} > div`)
      .should("have.css", "flex-direction", "column")

    cy.get(`#${context.id}`)
      .find("h2")
      .should("have.text", thisCtx.title)

    cy.get(`#${context.id}`)
      .find("p")
      .should("have.text", thisCtx.message)

    cy.get(`#${context.id}`)
      .find("span.material-symbols-outlined")
      .should("have.text", thisCtx.icon)
  })

  describe("Levels", () => {
    const levelContext = {
      ...context,
      title: "A alert!!",
      message: "This is an alert message."
    }

    it("Error", () => {
      const thisCtx = {
        ...levelContext,
        level: "error"
      }

      load(thisCtx)

      cy.get(`#${context.id}`)
        .then($alert => {
          const classNames = $alert.attr("class");
          ["text-error", "bg-error", "border-error"].forEach((st) => {
            expect(classNames.indexOf(st), st).to.be.gt(-1)
          })
        })

    })

    it("Info", () => {
      const thisCtx = {
        ...levelContext,
        level: "info"
      }

      load(thisCtx)

      cy.get(`#${context.id}`)
        .then($alert => {
          const classNames = $alert.attr("class");
          ["text-info", "bg-info", "border-info"].forEach((st) => {
            expect(classNames.indexOf(st), st).to.be.gt(-1)
          })
        })
    })

    it("Warning", () => {
      const thisCtx = {
        ...levelContext,
        level: "warn"
      }

      load(thisCtx)

      cy.get(`#${context.id}`)
        .then($alert => {
          const classNames = $alert.attr("class");
          ["text-warn", "bg-warn", "border-warn"].forEach((st) => {
            expect(classNames.indexOf(st), st).to.be.gt(-1)
          })
        })
    })

    it("Success", () => {
      const thisCtx = {
        ...levelContext,
        level: "success"
      }

      load(thisCtx)

      cy.get(`#${context.id}`)
        .then($alert => {
          const classNames = $alert.attr("class");
          ["text-success", "bg-success", "border-success"].forEach((st) => {
            expect(classNames.indexOf(st), st).to.be.gt(-1)
          })
        })
    })
  })
})