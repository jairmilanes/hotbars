/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
import qs from "qs";

const baseUrl = "http://localhost:3000"

Cypress.Commands.add('goTo', (path: string) => {
  cy.visit(`${baseUrl}${path}`)
});

Cypress.Commands.add('visitPartial', (name: string, context: Record<string, any>) => {
  const componentName = `/_hotbars/components/${encodeURIComponent(name)}`
  const tUrl = new URL(componentName, baseUrl)

  const query = qs.stringify({
    id: name + "-comp",
    ...context
  }, { encode: false })

  cy.visit(`${tUrl.toString()}?${query}`)
});

Cypress.Commands.add('switchTheme', (name: string) => {
  cy.get("html")
    .then(
      $html => {
        if (name === "dark") {
          $html.addClass("dark")
        } else {
          $html.removeClass("dark")
        }
      }
    )
});

Cypress.Commands.add('login', () => {
  cy.request("POST", `${baseUrl}/_hotbars/_sign-in/local?type=json`, {
    "username": "jmilanes@dashfy.ca",
    "password": "09089816"
  }).then((response) => {
    if (response.status === 200) {
      return cy.log(response.body)
    }
    throw new Error("Sign-in attempt failed.")
  })
});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
   namespace Cypress {
     interface Chainable {
       login(): Chainable<void>
       goTo(path: string): Chainable<void>
       visitPartial(name: string, context: Record<string, any>): Chainable<void>
       switchTheme(name: string): Chainable<void>
       // drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
       // dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
       // visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
     }
   }
}