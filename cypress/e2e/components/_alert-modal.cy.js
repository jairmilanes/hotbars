/// <reference types="cypress" />
import qs from "qs"

context('Alert Modal', () => {

  const load = (ctx) => {
    cy.visitPartial("_button", ctx)
  }

  it("Should render", () => {
    const context = {
      id: "my-modal",
      message: "This is an test alert!",
      description: "My alert description with extra text."
    }

    load({
      text: "Alert"
    })

    cy.window()
      .then($win => {

        cy.get("button").invoke('on', 'click', () => {
            $win.$.modals.alert(context, (type) => {
              if (type === "closed") {
                cy.get(`div[data-modal="${context.id}"]`)
                  .should("not.exist")
              }
            })

            cy.get(`div[data-modal="${context.id}"]`)
              .should("exist")

            cy.get(`div[data-modal="${context.id}"]`)
              .find("button[data-dismiss]")
              .should("have.length", 2)
              .first()
              .should("contain.text", "close")

            cy.get(`div[data-modal-body="${context.id}"] > span`)
              .first()
              .should("contain.text", "info")

            cy.get(`div[data-modal="${context.id}"]`)
              .find("h4")
              .last()
              .should("contain.text", context.message)

            cy.get(`div[data-modal="${context.id}"]`)
              .find("h4")
              .last()
              .should("contain.text", context.message)

            cy.get(`div[data-modal="${context.id}"]`)
              .find("button[data-dismiss]")
              .last()
              .should("contain.text", "Ok, got it!")

            cy.get(`div[data-modal-body="${context.id}"]`)
              .find("button")
              .click()
          })

        cy.get("button").click()
      })

    //
  })
})