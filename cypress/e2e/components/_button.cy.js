/// <reference types="cypress" />
import qs from "qs"

context('Button', () => {
  const baseUrl = "http://localhost:3000"
  const componentName = "/_hotbars/components/_button"
  const context = {
    id: "my-button"
  };

  const load = (params) => {
    const tUrl = new URL(componentName, baseUrl)

    const query = qs.stringify({
      ...context,
      ...params
    }, { encode: false })

    cy.visit(`${tUrl.toString()}?${query}`)
  }

  beforeEach(() => {})

  it("Should display text only", () => {
    load({ text: "Click me!" })
    cy
      .get("#test-container")
      .find('button')
      .then(($btn) => {
        expect($btn).to.exist
        expect($btn.attr("id")).to.eq(context.id)
        const children = $btn.children()
        expect(children.length).to.eq(1)
        const el = children.first()
        expect(el.text().trim()).to.eq("Click me!")
      })
  })

  it("Should display icon only", () => {
    load({ icon: "check"})
    cy
      .get("#test-container")
      .find('button')
      .then(($btn) => {
        expect($btn).to.exist
        expect($btn.attr("id")).to.eq(context.id)
        const children = $btn.children()
        expect(children.length).to.eq(1)
        const icon = children.first()
        expect(icon.text().trim()).to.eq("check")
      })
  })

  it("Should display prefix icon", () => {
    const thiCtx = { ...context, text: "Click me!", prefixIcon: "check" }
    load(thiCtx)
    cy
      .get("#test-container")
      .find('button')
      .then(($btn) => {
        expect($btn).to.exist
        expect($btn.attr("id")).to.eq(thiCtx.id)

        const children = $btn.children()
        const icon = children.first()
        expect(icon.text().trim()).to.eq("check")
        const text = children.last()
        expect(text.text().trim()).to.eq(thiCtx.text)
      })
  })

  it("Should display suffix icon", () => {
    const thiCtx = { ...context, text: "Click me!", suffixIcon: "check" }
    load(thiCtx)
    cy
      .get("#test-container")
      .find('button')
      .then(($btn) => {
        expect($btn).to.exist
        expect($btn.attr("id")).to.eq(thiCtx.id)

        const children = $btn.children()
        const icon = children.last()
        expect(icon.text().trim()).to.eq("check")
        const text = children.first()
        expect(text.text().trim()).to.eq(thiCtx.text)
      })
  })

  it("Should dispatch", () => {
    const thiCtx = {
      ...context,
      text: "Dispatch",
      attributes: {
        "data-dispatch": "hb-my-event",
        "data-test": "Hell-Yeahh!"
      }
    }

    load(thiCtx)

    const data = {}
    const callback = (e) => {
      const { dispatch, test } = e.___td
      expect(dispatch).to.eq(thiCtx.attributes["data-dispatch"])
      expect(test).to.eq(thiCtx.attributes["data-test"])
    }

    cy.document().then($doc => {
      $doc.addEventListener(thiCtx.attributes["data-dispatch"], callback)
    })

    cy
      .get("#test-container")
      .find('button')
      .click()
  })

  it("Should be disabled", () => {
    const thiCtx = { ...context, text: "Click me!", disabled: true }
    load(thiCtx)
    cy
      .get("#test-container")
      .find('button')
      .then(($btn) => {
        expect($btn).to.exist
        expect($btn.prop("disabled")).to.eq(true)
      })
  })

  it("Should display loading icon", () => {
    const thiCtx = { ...context, text: "Click me!", loader: true }

    load(thiCtx)

    cy.window()
      .then($win => {

        const btn = $win.$(`#${thiCtx.id}`).button()

        btn.loading(true)

        cy
          .get("#test-container")
          .find('button')
          .find("div[data-spinner=\"true\"]")
          .should("exist")
          .and("not.have.class", "hidden")
          .and("be.visible")
      })
  })
})