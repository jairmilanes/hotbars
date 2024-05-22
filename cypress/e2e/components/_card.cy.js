/// <reference types="cypress" />
import qs from "qs"

context('Card', () => {

  const load = (ctx) => {
    cy.visitPartial("_card", ctx)
  }

  const baseContext = {
    id: "my-card",
    title: "Card title!",
    description: "This is card description text that sometimes can be long to explaign a metric or goal.",
  }

  it("Should render", () => {
    const context = {
      ...baseContext,
      size: "sm",
      theme: "default"
    }

    load(context)

    cy.get(`div[data-card="${context.id}"]`)
      .should("exist")
  });

  ["primary", "success", "info", "warn", "error"].forEach((level) => {
    it(`Should render ${level} style`, () => {
      const context = {
        ...baseContext,
        size: "sm",
        theme: level,

      }

      load(context)

      cy.get(`div[data-card="${context.id}"]`)
        .should("exist")
        .and("have.class", `dark:bg-${level}-600`)
        .and("have.class", `bg-${level}-200`)
    })
  })

  it.only("Should render custom", () => {
    const context = {
      ...baseContext,
      size: "sm",
      theme: "custom",
      color: "white",
      bg: {
        dark: {
          value: "amber",
          intensity: "400"
        },
        light: {
          value: "lime",
          intensity: "400"
        }
      },
      border: {
        dark: {
          value: "purple",
          intensity: "600"
        },
        light: {
          value: "orange",
          intensity: "600"
        }
      }
    }

    load(context)

    const { bg, border } = context

    cy.get(`div[data-card="${context.id}"]`).as("Card")
      .should("exist")
      .and("has.class", `dark:bg-${bg.dark.value}-${bg.dark.intensity}`)
      .and("has.class", `bg-${bg.light.value}-${bg.light.intensity}`)
      .and("has.class", `dark:border-${border.dark.value}-${border.dark.intensity}`)
      .and("has.class", `border-${border.light.value}-${border.light.intensity}`)
      .and("have.class", "dark:text-white")
      .and("have.class", "text-white")

    cy.switchTheme("light")
  });
})