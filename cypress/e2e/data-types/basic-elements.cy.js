/// <reference types="cypress" />

context('Data Types', () => {

  beforeEach(() => {
    cy.goTo("/_hotbars/_data-types?type=demo")
    cy.intercept('GET', 'http://localhost:3000/_api/__types*', {
      fixture: "types.json",
    })
  })

  it("Should render", () => {
    cy.get("#hb-data-type-view").should("exist")
    cy.get("#hb-types").should("exist")
    cy.get("#hb-data-items-footer").should("exist")
    cy.get("button[data-dispatch=\"hb-create-type\"]").should("exist")
    cy.get("button[data-dispatch=\"hb-new-field\"]").should("exist")
    cy.get("button[data-dispatch=\"hb-new-header\"]").should("exist")
    cy.get("button[data-dispatch=\"hb-group-fields\"]:not([data-type=\"list\"])").should("exist")
    cy.get("button[data-dispatch=\"hb-group-fields\"][data-type=\"list\"]").should("exist")
    cy.get("button[data-dismiss=\"hb-type-form\"]").should("exist")
    cy.get("button#hb-save-type[type=\"submit\"]").should("exist")
  })

  it("Should open new field form", () => {
    cy.get("#hb-list-menu-container")
      .find("button[data-dispatch=\"hb-new-field\"]")
      .click()

    cy.get("div[data-modal=\"add-field-form\"]")
      .should("exist")
      .find("form#hb-add-field-form")
      .should("exist")
      .parents("div[data-modal=\"add-field-form\"]")
      .find("button[data-dismiss=\"add-field-form\"]")
      .click()
  })

  it("Should open new header form", () => {
    cy.get("#hb-list-menu-container")
      .find("button[data-dispatch=\"hb-new-header\"]")
      .click()

    cy.get("div[data-modal=\"add-header-form\"]")
      .should("exist")
      .find("form#hb-add-header-form")
      .should("exist")
      .parents("div[data-modal=\"add-header-form\"]")
      .find("button[data-dismiss=\"add-header-form\"]")
      .click()
  })

  it("Should open new group form", () => {
    cy.get("#hb-list-menu-container")
      .find("button[data-dispatch=\"hb-group-fields\"]:not([data-type=\"list\"])")
      .click()

    cy.get("div[data-modal=\"create-group-modal\"]")
      .should("exist")
      .find("form#hb-create-group-form")
      .should("exist")
      .parents("div[data-modal=\"create-group-modal\"]")
      .find("button[data-dismiss=\"create-group-modal\"]")
      .click()
  })

  it("Should open new list form", () => {
    // cy.intercept("/_api/__types/?page=1").as("DataTypesLoaded")
    cy.get("#hb-list-menu-container")
      .find("button[data-dispatch=\"hb-group-fields\"][data-type=\"list\"]")
      .click()

    // cy.wait("@@DataTypesLoaded")
    cy.get("div[data-modal=\"create-group-modal\"]")
      .should("exist")
      .find("form#hb-create-group-form")
      .should("exist")
      .parents("div[data-modal=\"create-group-modal\"]")
      .find("button[data-dismiss=\"create-group-modal\"]")
      .click()

    cy.get("div[data-modal=\"create-group-modal\"]")
      .should("not.exist")
  })

  it("Should load field types", () => {
    cy.get("#hb-type-form")
      .as("form")
      .should("exist")

    cy.get("@form")
      .find("h3")
      .first()
      .should("contain.text", "Demo settings")

    cy.get("@form")
      .find("button[data-dispatch=\"hb-delete-type-confirm\"]")
      .should("exist")
      .and("contain.text", "Delete type")

    cy.get("@form")
      .find("div[data-input-container=\"title\"]")
      .should("exist")

    cy.get("@form")
      .find("div[data-input-container=\"iconName\"]")
      .should("exist")
  })

  it("Should have type tabs", () => {
    const tags = [
      { id: "hbs-fields-content", title: "Fields" },
      { id: "hbs-settings-content", title: "Settings" },
      { id: "hbs-listView-content", title: "List view" },
      { id: "hbs-detailView-content", title: "Details view" }
    ]

    cy.get("#hb-type-form")
      .find("ul[data-tabs-toggle=\"#hbs-view-config-content\"]")
      .as("list")

    cy.wrap(tags).each((tab, i) => {
      cy.get("@list")
        .find(`li > button[data-tabs-target="#${tab.id}"]`)
        .should("exist")
        .and("contain.text", tab.title)
        .click()

      cy.get(`#${tab.id}`).should("be.visible")
    })
  })

  it("Should have list headers", () => {
    cy.get("#hbs-fields-content > div")
      .first()
      .should("exist")
      .find("div")
      .should("have.length", 7)
      .each((header, i) => {
        if (i === 2) expect(header).to.have.text("Name")
        if (i === 3) expect(header).to.have.text("Type")
        if (i === 4) expect(header).to.have.text("Attributes")
        if (i === 5) expect(header).to.have.text("Placement")
        if (i === 6) expect(header).to.have.text("Actions")
      })
  })

  it("Should have selectable column", () => {
    cy.get("#hb-fields-container > div")
      .each((row, i) => {
        const column = row.find("div").first()
        const checkbox = column.find("input[type='checkbox']")
        expect(checkbox).to.exist
      })
  })

  it("Should have move up & down action", () => {
    cy.get("#hb-fields-container > div")
      .each((row, i) => {
        const column = row.find("div").last()

        expect(column.children().length).to.equal(2)
        expect(column.find("button[data-dispatch=\"hb-move-field-up\"]")).to.exist
        expect(column.find("button[data-dispatch=\"hb-move-field-down\"]")).to.exist
      })
  })

  it("Should have edit action", () => {
    const validateRow = (row) => {
      const columns = row.children()
      const name = columns.eq(1).text().trim().toLowerCase()

      if (name === "id") return;

      if (row.data("group")) {
        const column = columns.first().children().last()

        const editBtn = column.find(`button[data-dispatch^="hb-edit-"]`)
        expect(editBtn).to.exist

        const newFieldBtn = column.find(`button[data-dispatch="hb-new-field"]`)
        expect(newFieldBtn).to.exist

        const newHeaderBtn = column.find(`button[data-dispatch="hb-new-header"]`)
        expect(newHeaderBtn).to.exist

        const children = columns.last().children()

        children.each((i, childRow) => {
          const c = Cypress.$(childRow)
          return validateRow(c)
        })
      } else {
        const column = columns.last()
        const editBtn = column.find(`button[data-dispatch^="hb-edit-"]`)

        expect(editBtn).to.exist
        expect(editBtn).to.have.data("id")

        if (row.data("header")) {
          expect(editBtn).to.have.data("dispatch", "hb-edit-header")
        }

        if (row.data("field")) {
          expect(editBtn).to.have.data("dispatch", "hb-edit-field")
        }
      }
    }

    cy.get("#hb-fields-container > div")
      .each((row, i) => validateRow(row))
  })

  it("Should display attributes", () => {
    cy.fixture("types.json").then((data) => {
      const type = data.items[0]
      const { fields } = type

      cy.log(type)

      const validateRow = (row, groupName) => {
        const name = row.data("name")

        if (row.data("header")) return;

        if (row.data("group")) {
          const groupName = row.data("name")
          const children = row.children().last().children()
          children.each((i, el) => {
            validateRow(Cypress.$(el), groupName)
          })
          return;
        }

        const id = row.data("field")
        const field = (
          groupName
          ? fields.find(f => f.name === groupName)?.children
          : fields
        ).find(f => f.name === name)

        const attrs = row
          .find(`div[data-attributes="${id}"]`)
          .children()
          .toArray()
          .map(el => Cypress.$(el).data("attr-type"))

        expect(field.required).to.equal(attrs.indexOf("required") > -1)
        expect(field.listHeader).to.equal(attrs.indexOf("listHeader") > -1)
        expect(field.readOnly).to.equal(attrs.indexOf("readOnly") > -1)
        expect(field.searchable).to.equal(attrs.indexOf("searchable") > -1)
      }

      cy.get("#hb-fields-container > div")
        .each((row) => validateRow(row))
    })
  })
})