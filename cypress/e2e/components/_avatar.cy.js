/// <reference types="cypress" />
import qs from "qs"

context('Alert Message', () => {

  const load = (ctx) => {
    cy.visitPartial("_avatar", ctx)
  }

  it("Should render defaults", () => {
    const context = {}

    load(context)

    cy.get("div[data-avatar]")
      .should("exist")
      .find("svg")
      .should("exist")
      .and("have.class", "w-10")
      .and("have.class", "h-10")
  })

  it("Should render image", () => {
    const context = {
      image: "https://ui-avatars.com/api/?name=jmilanes"
    }

    load(context)

    cy.get("div[data-avatar]")
      .should("exist")
      .find("img")
      .should("have.class", "w-10")
      .and("have.class", "h-10")
  })

  it("Should change sizes", () => {
    const context = {
      size: 24
    }

    load(context)

    cy.get("div[data-avatar]")
      .should("exist")
      .find("svg")
      .should("have.class", "w-24")
      .and("have.class", "h-24")

    load({
      ...context,
      image: "https://ui-avatars.com/api/?name=jmilanes"
    })

    cy.get("div[data-avatar]")
      .should("exist")
      .find("img")
      .should("have.class", "w-24")
      .and("have.class", "h-24")
  })

})