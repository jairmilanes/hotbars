/// <reference types="cypress" />

context('Page Modules: Gallery', () => {

  const load = (ctx) => {
    cy.visitPartial("_page-modules/_gallery", ctx)
  }

  const context = {
    id: "my-gallery",
    thumbnails: false,
    pagination: false,
    modules: "gallery",
    gallery: [
      { id: "image-1", url: "https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", alt: "Some alt 1" },
      { id: "image-2", url: "https://images.pexels.com/photos/4674333/pexels-photo-4674333.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", alt: "Some alt 2" },
      { id: "image-3", url: "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", alt: "Some alt 3" },
      { id: "image-4", url: "https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", alt: "Some alt 4" },
      { id: "image-5", url: "https://images.pexels.com/photos/712614/pexels-photo-712614.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", alt: "Some alt 5" },
      { id: "image-1", url: "https://images.pexels.com/photos/2127732/pexels-photo-2127732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", alt: "Some alt 6" },
      { id: "image-2", url: "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", alt: "Some alt 7" },
      { id: "image-3", url: "https://images.pexels.com/photos/6740944/pexels-photo-6740944.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", alt: "Some alt 8" },
      { id: "image-4", url: "https://images.pexels.com/photos/39501/lamborghini-brno-racing-car-automobiles-39501.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", alt: "Some alt 9" },
      { id: "image-5", url: "https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", alt: "Some alt 10" }
    ]
  }

  it("Should render", () => {
    load(context)

    cy.window()
      .then($win => {
        expect(Cypress.$(`div[data-slider="${context.id}"]`)).to.exist
        expect(Cypress.$(".splide__pagination")).to.not.exist
        expect(Cypress.$(`div[data-thumbs="${context.id}"]`)).to.not.exist
      })
  })

  it("Should show pagination", () => {
    const ctx = { ...context }
    ctx.pagination = true
    load(ctx)

    cy.window()
      .then($win => {
        expect(Cypress.$(`div[data-slider="${ctx.id}"]`)).to.exist
        expect(Cypress.$(".splide__pagination")).to.exist
        expect(Cypress.$(`div[data-thumbs="${ctx.id}"]`)).to.not.exist
      })
  })

  it.only("Should show thumbnails", () => {
    const ctx = { ...context }
    ctx.thumbnails = true
    load(ctx)

    cy.window()
      .then($win => {
        expect(Cypress.$(`div[data-slider="${ctx.id}"]`)).to.exist
        expect(Cypress.$(".splide__pagination")).to.not.exist
        expect(Cypress.$(`div[data-thumbs="${ctx.id}"]`)).to.exist
      })
  })
})