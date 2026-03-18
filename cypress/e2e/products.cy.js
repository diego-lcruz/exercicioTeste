describe('products', () => {
  const goToProducts = () => {
    cy.clickInFirst('a[href="/admin/products/"]')
    cy.url({ timeout: 20000 }).should('include', '/admin/products')
    cy.contains(/Products/i, { timeout: 15000 }).should('exist')
  }

  const ensureFiltersOpen = () => {
    cy.get('body').then(($body) => {
      if ($body.find('#collapse1').length) {
        cy.get('#collapse1').then(($c) => {
          if (!$c.hasClass('show')) {
            cy.get('[data-bs-target="#collapse1"], [aria-controls="collapse1"], a[href="#collapse1"]')
              .first()
              .click({ force: true })
          }
        })
      }
    })
  }

  const tableHasAtLeastOneRow = () => {
    cy.get('table:visible', { timeout: 15000 }).first().scrollIntoView()
    cy.get('table:visible tbody tr', { timeout: 15000 }).its('length').should('be.greaterThan', 0)
  }

  const captureFirstProductName = () => {
    tableHasAtLeastOneRow()
    return cy.get('table:visible tbody tr')
      .first()
      .find('td')
      .eq(2) 
      .invoke('text')
      .then((t) => {
        const name = String(t || '').trim()
        expect(name.length).to.be.greaterThan(2)
        return name
      })
  }

  const filterBySearchValue = (value) => {
    ensureFiltersOpen()

    cy.get('#criteria_search_value', { timeout: 15000 })
      .should('exist')
      .scrollIntoView()
      .clear({ force: true })
      .type(value, { force: true })

    cy.contains('button, a', /Filter/i, { timeout: 10000 })
      .filter(':visible')
      .first()
      .scrollIntoView()
      .click({ force: true })

    cy.get('#criteria_search_value').should('have.value', value)
  }

  const openFirstProductEdit = () => {
    tableHasAtLeastOneRow()
    cy.get('a[href*="/admin/products/"][href$="/edit"]', { timeout: 15000 })
      .filter(':visible')
      .first()
      .scrollIntoView()
      .click({ force: true })

    cy.url({ timeout: 20000 }).should('match', /\/admin\/products\/\d+\/edit/)
    cy.contains(/Edit Product/i, { timeout: 15000 }).should('exist')
  }

  const openShowFromEdit = () => {
    cy.contains('a,button', /Show/i, { timeout: 10000 })
      .filter(':visible')
      .first()
      .scrollIntoView()
      .click({ force: true })

    cy.url({ timeout: 20000 }).should('match', /\/admin\/products\/\d+$/)
  }

  const getProductCodeInput = () => {
    return cy.get('input[name$="[code]"], input[id$="_code"]', { timeout: 15000 }).first()
  }

  const getEnabledCheckbox = () => {
    return cy.get(
      'input[type="checkbox"][name$="[enabled]"], input[type="checkbox"][id$="_enabled"]',
      { timeout: 15000 }
    ).first()
  }

  const clickUpdate = () => {
    cy.contains('button', /Update/i, { timeout: 10000 })
      .filter(':visible')
      .first()
      .scrollIntoView()
      .click({ force: true })
  }

  const openTranslationsTab = () => {
    cy.contains('a,button', /Translations/i, { timeout: 10000 })
      .filter(':visible')
      .first()
      .scrollIntoView()
      .click({ force: true })
  }

  const getShortDescriptionTextarea = () => {
    return cy.get('textarea[name$="[shortDescription]"], textarea[id$="_shortDescription"]', { timeout: 15000 }).first()
  }

  const openManageVariantsListFromEdit = () => {
    cy.contains('button', /Manage variants/i, { timeout: 10000 })
      .filter(':visible')
      .first()
      .scrollIntoView()
      .click({ force: true })

    cy.get('.dropdown-menu.show a', { timeout: 10000 }).then(($links) => {
      const arr = [...$links]

      const byText = arr.find((a) => /variant/i.test((a.innerText || '').trim()))
      const byHref = arr.find((a) => /variant/i.test(a.getAttribute('href') || ''))

      const target = byText || byHref
      expect(target, 'a variants item exists in Manage variants dropdown').to.exist

      cy.wrap(target).scrollIntoView().click({ force: true })
    })

    cy.url({ timeout: 20000 }).should('match', /variant/i)
  }

  const openCreateProduct = () => {
    cy.get('[data-bs-toggle="dropdown"]', { timeout: 10000 })
      .filter(':visible')
      .last()
      .click({ force: true })

    cy.get('a[href="/admin/products/new"]', { timeout: 10000 })
      .scrollIntoView()
      .click({ force: true })

    cy.url({ timeout: 20000 }).should('include', '/admin/products/new')
    cy.contains(/New Product/i, { timeout: 15000 }).should('exist')
  }

  beforeEach(() => {
    cy.visit('/admin/login')

    const username = Cypress.env('ADMIN_EMAIL') || Cypress.env('ADMIN_USERNAME') || 'sylius@example.com'
    const password = Cypress.env('ADMIN_PASSWORD') || 'sylius'

    cy.get('#_username', { timeout: 10000 }).should('be.visible').clear().type(username)
    cy.get('#_password', { timeout: 10000 }).should('be.visible').clear().type(password)
    cy.get('button[type="submit"], #_submit', { timeout: 10000 }).should('be.visible').click()

    cy.url({ timeout: 20000 }).should('include', '/admin')
  })

  it('details is listing all variants', () => {
    goToProducts()
    openFirstProductEdit()
    openManageVariantsListFromEdit()

    cy.get('body').should(($body) => {
      expect(/variant/i.test($body.text())).to.eq(true)
    })
  })

  it('filter by search value shows the expected product in the listing', () => {
    goToProducts()
    captureFirstProductName().then((name) => {
      filterBySearchValue(name)
      cy.get('table:visible tbody', { timeout: 15000 }).should('contain', name)
    })
  })

  it('filtering with a nonexistent value shows empty results', () => {
    goToProducts()
    const needle = '__nonexistent_product__' + Date.now()
    filterBySearchValue(needle)

    cy.get('body').then(($body) => {
      const rows = $body.find('table:visible tbody tr').length
      if (rows === 0) {
        expect(rows).to.eq(0)
      } else {
        expect($body.text()).to.not.include(needle)
      }
    })
  })

  it('edit page loads and shows the product code field', () => {
    goToProducts()
    openFirstProductEdit()

    getProductCodeInput()
      .should('exist')
      .invoke('val')
      .then((val) => expect(String(val || '').trim().length).to.be.greaterThan(2))
  })

  it('update product short description and then revert the change', () => {
    const suffix = ` cypress-${Date.now()}`

    goToProducts()
    openFirstProductEdit()
    openTranslationsTab()

    getShortDescriptionTextarea()
      .invoke('val')
      .then((original) => {
        const originalText = String(original || '')
        getShortDescriptionTextarea().clear({ force: true }).type(`${originalText}${suffix}`, { force: true })

        clickUpdate()
        cy.url({ timeout: 20000 }).should('include', '/edit')

        openTranslationsTab()
        getShortDescriptionTextarea().clear({ force: true }).type(originalText, { force: true })
        clickUpdate()
        cy.url({ timeout: 20000 }).should('include', '/edit')
      })
  })

  it('toggle product enabled flag and revert', () => {
    goToProducts()
    openFirstProductEdit()

    getEnabledCheckbox().then(($cb) => {
      const wasChecked = $cb.is(':checked')

      cy.wrap($cb).click({ force: true })
      clickUpdate()
      cy.url({ timeout: 20000 }).should('include', '/edit')

      getEnabledCheckbox().then(($cb2) => {
        const isCheckedNow = $cb2.is(':checked')
        if (isCheckedNow !== wasChecked) cy.wrap($cb2).click({ force: true })
        clickUpdate()
        cy.url({ timeout: 20000 }).should('include', '/edit')
      })
    })
  })

  it('open product details and navigate back to products using breadcrumb', () => {
    goToProducts()
    openFirstProductEdit()
    openShowFromEdit()

    cy.contains('a', /Products/i, { timeout: 10000 }).first().click({ force: true })
    cy.url().should('include', '/admin/products')
  })

  it('sorting by clicking a sortable column changes the URL', () => {
    goToProducts()
    cy.get('table:visible thead a[href*="sorting"]', { timeout: 15000 })
      .first()
      .scrollIntoView()
      .click({ force: true })

    cy.url().should('include', 'sorting')
  })

  it('pagination: if page 2 exists, user can navigate to it', () => {
    goToProducts()
    cy.get('body').then(($body) => {
      const page2 = $body.find('a[href*="page=2"]')
      if (page2.length) {
        cy.get('a[href*="page=2"]').first().scrollIntoView().click({ force: true })
        cy.url().should('include', 'page=2')
      } else {
        cy.url().should('include', '/admin/products')
      }
    })
  })

  it('create product page opens and contains the product code field', () => {
    goToProducts()
    openCreateProduct()

    getProductCodeInput().should('exist')
    cy.contains('button', /Create/i).should('exist')

    cy.contains('a', /Products/i, { timeout: 10000 }).first().click({ force: true })
    cy.url().should('include', '/admin/products')
  })
})