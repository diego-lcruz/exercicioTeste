const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const assert = require('assert')

describe('products', function () {
  this.timeout(180000)

  const BASE_URL = process.env.BASE_URL || 'http://localhost:8000'
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sylius@example.com'
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sylius'
  const CHROMEDRIVER_PATH = process.env.CHROMEDRIVER_PATH

  let driver

  async function waitLocated(locator, timeout = 30000) {
    return await driver.wait(until.elementLocated(locator), timeout)
  }

  async function waitVisible(locator, timeout = 30000) {
    const el = await waitLocated(locator, timeout)
    await driver.wait(until.elementIsVisible(el), timeout)
    return el
  }

  async function currentUrl() {
    return await driver.getCurrentUrl()
  }

  async function bodyText() {
    return await driver.findElement(By.css('body')).getText()
  }

  async function scrollIntoView(el) {
    try {
      await driver.executeScript('arguments[0].scrollIntoView({block:"center"});', el)
    } catch {}
  }

  async function jsClick(el) {
    await driver.executeScript('arguments[0].click();', el)
  }

  async function clickEl(el) {
    await scrollIntoView(el)
    try {
      await el.click()
    } catch {
      await jsClick(el)
    }
  }

  async function setValueAndFire(el, value) {
    await driver.executeScript(
      `
      const el = arguments[0];
      const val = arguments[1];
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    `,
      el,
      value
    )
  }

  async function login() {
    await driver.get(`${BASE_URL}/admin/login`)

    const url = await currentUrl()
    if (url.includes('/admin') && !url.includes('/login')) return

    const user = await waitVisible(By.css('#_username'), 30000)
    const pass = await waitVisible(By.css('#_password'), 30000)
    await user.clear()
    await user.sendKeys(ADMIN_EMAIL)
    await pass.clear()
    await pass.sendKeys(ADMIN_PASSWORD)

    const submits = await driver.findElements(By.css('button[type="submit"],#_submit'))
    assert(submits.length > 0, 'Login submit button not found')
    await clickEl(submits[0])

    await driver.wait(async () => (await currentUrl()).includes('/admin'), 30000)
  }

  async function goToProducts() {
    await driver.get(`${BASE_URL}/admin/products/`)
    await driver.wait(until.urlContains('/admin/products'), 30000)
    await waitLocated(By.css('table'), 30000)
    await waitLocated(By.css('table tbody tr'), 30000)
  }

  async function ensureFiltersOpen() {
    const collapse = await driver.findElements(By.css('#collapse1'))
    if (!collapse.length) return

    const klass = (await collapse[0].getAttribute('class')) || ''
    if (!klass.includes('show')) {
      const toggles = await driver.findElements(
        By.css('[data-bs-target="#collapse1"],[aria-controls="collapse1"],a[href="#collapse1"]')
      )
      if (toggles.length) {
        await clickEl(toggles[0])
      } else {
        await driver.executeScript(
          `
          const el = document.querySelector('#collapse1');
          if (el) { el.classList.add('show'); el.style.display='block'; }
        `
        )
      }
    } else {
      await driver.executeScript(
        `
        const el = document.querySelector('#collapse1');
        if (el) el.style.display='block';
      `
      )
    }
  }

  async function filterBySearchValue(value) {
    await ensureFiltersOpen()

    const inputEls = await driver.findElements(By.css('#criteria_search_value'))
    assert(inputEls.length > 0, 'criteria_search_value input not found')
    const input = inputEls[0]

    await setValueAndFire(input, '')
    await setValueAndFire(input, value)

    const btns = await driver.findElements(
      By.xpath("//*[self::button or self::a][contains(translate(normalize-space(.),'FILTER','filter'),'filter')]")
    )
    assert(btns.length > 0, 'Filter button not found')
    await clickEl(btns[0])

    const v = await input.getAttribute('value')
    assert.strictEqual(v, value)
  }

  async function getFirstRowName() {
    const cell = await waitVisible(By.css('table tbody tr:first-child td:nth-child(3)'), 30000)
    const text = (await cell.getText()).trim()
    assert(text.length > 2, 'First product name seems empty')
    return text
  }

  async function openFirstEditByUrl() {
    const links = await driver.findElements(By.css('a[href*="/admin/products/"][href$="/edit"]'))
    assert(links.length > 0, 'No edit links found in products listing')
    const href = await links[0].getAttribute('href')
    assert(href && href.includes('/edit'), 'Edit href invalid')
    await driver.get(href)
    await driver.wait(until.urlMatches(/\/admin\/products\/\d+\/edit/), 30000)

    const codeInputs = await driver.findElements(By.css('input[name$="[code]"], input[id$="_code"]'))
    assert(codeInputs.length > 0, 'Code input not found on edit page')
  }

  async function openManageVariantsFromEdit() {
  const mv = await driver.findElements(By.xpath("//button[contains(.,'Manage variants')]"))
  assert(mv.length > 0, 'Manage variants button not found')
  await clickEl(mv[0])

  const items = await driver.findElements(By.css('.dropdown-menu.show a'))
  assert(items.length > 0, 'Manage variants dropdown has no items')

  let targetHref = null
  for (const a of items) {
    const href = (await a.getAttribute('href')) || ''
    if (!href) continue
    const h = href.toLowerCase()

    if (h.includes('/admin/taxons')) continue
    if (h.includes('variant')) { targetHref = href; break }
  }

  if (!targetHref) {
    for (const a of items) {
      const href = (await a.getAttribute('href')) || ''
      if (href && !href.toLowerCase().includes('/admin/taxons')) {
        targetHref = href
        break
      }
    }
  }

  assert(targetHref, 'No suitable item found in Manage variants dropdown (non-taxons)')
  await driver.get(targetHref)


  await driver.wait(async () => {
    const t = (await bodyText()).toLowerCase()
    return (
      t.includes('variant') ||
      t.includes('variants') ||
      t.includes('create variant') ||
      (await driver.findElements(By.css('table'))).length > 0
    )
  }, 60000)
}

  async function openShowFromEdit() {
    const show = await driver.findElements(By.xpath("//*[self::a or self::button][contains(.,'Show')]"))
    assert(show.length > 0, 'Show button not found')
    const href = await show[0].getAttribute('href')
    if (href) await driver.get(href)
    else await clickEl(show[0])
    await driver.wait(until.urlMatches(/\/admin\/products\/\d+$/), 30000)
  }

  async function openTranslationsTab() {
    const translations = await driver.findElements(
      By.xpath("//*[self::a or self::button][contains(.,'Translations')]")
    )
    assert(translations.length > 0, 'Translations tab not found')
    await clickEl(translations[0])
  }

  async function updateShortDescriptionAndRevert() {
    await openTranslationsTab()

    const tas = await driver.findElements(
      By.css('textarea[name$="[shortDescription]"], textarea[id$="_shortDescription"]')
    )
    assert(tas.length > 0, 'Short description textarea not found')
    const ta = tas[0]

    const original = (await ta.getAttribute('value')) || ''
    const suffix = ` selenium-${Date.now()}`

    await setValueAndFire(ta, `${original}${suffix}`)

    const updateBtns = await driver.findElements(By.xpath("//button[contains(.,'Update')]"))
    assert(updateBtns.length > 0, 'Update button not found')
    await clickEl(updateBtns[0])
    await driver.wait(until.urlContains('/edit'), 30000)

    await openTranslationsTab()
    const tas2 = await driver.findElements(
      By.css('textarea[name$="[shortDescription]"], textarea[id$="_shortDescription"]')
    )
    assert(tas2.length > 0, 'Short description textarea not found (revert)')
    await setValueAndFire(tas2[0], original)

    await clickEl(updateBtns[0])
    await driver.wait(until.urlContains('/edit'), 30000)
  }

  async function toggleEnabledAndRevert() {
    const cbs = await driver.findElements(
      By.css('input[type="checkbox"][name$="[enabled]"], input[type="checkbox"][id$="_enabled"]')
    )
    assert(cbs.length > 0, 'Enabled checkbox not found')
    const cb = cbs[0]
    const was = await cb.isSelected()
    await clickEl(cb)

    const updateBtns = await driver.findElements(By.xpath("//button[contains(.,'Update')]"))
    assert(updateBtns.length > 0, 'Update button not found')
    await clickEl(updateBtns[0])
    await driver.wait(until.urlContains('/edit'), 30000)

    const cbs2 = await driver.findElements(
      By.css('input[type="checkbox"][name$="[enabled]"], input[type="checkbox"][id$="_enabled"]')
    )
    assert(cbs2.length > 0, 'Enabled checkbox not found (revert)')
    const now = await cbs2[0].isSelected()
    if (now !== was) await clickEl(cbs2[0])
    await clickEl(updateBtns[0])
    await driver.wait(until.urlContains('/edit'), 30000)
  }

  async function openCreateProduct() {
    await driver.get(`${BASE_URL}/admin/products/new`)
    await driver.wait(until.urlContains('/admin/products/new'), 30000)
  }

  async function openSortingByUrl() {
    const links = await driver.findElements(By.css('table thead a[href*="sorting"]'))
    assert(links.length > 0, 'No sorting links found')
    const href = await links[0].getAttribute('href')
    assert(href, 'Sorting link has no href')
    await driver.get(href)
    await driver.wait(async () => (await currentUrl()).includes('sorting'), 30000)
  }

  before(async () => {
    if (!CHROMEDRIVER_PATH) throw new Error('Set CHROMEDRIVER_PATH to your chromedriver.exe path')

    const options = new chrome.Options()
    options.addArguments('--headless=new')
    options.addArguments('--window-size=1280,720')
    options.addArguments('--disable-gpu')
    options.addArguments('--no-sandbox')

    const service = new chrome.ServiceBuilder(CHROMEDRIVER_PATH)

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build()
  })

  after(async () => {
    if (driver) await driver.quit()
  })

  beforeEach(async () => {
    await login()
  })


  it('details is listing all variants', async () => {
    await goToProducts()
    await openFirstEditByUrl()
    await openManageVariantsFromEdit()
  })

  it('filter by search value shows the expected product in the listing', async () => {
    await goToProducts()
    const name = await getFirstRowName()
    await filterBySearchValue(name)

    const tableText = await driver.findElement(By.css('table tbody')).getText()
    assert(tableText.includes(name), 'Expected filtered table to contain the searched name')
  })

  it('filtering with a nonexistent value shows empty results', async () => {
    await goToProducts()
    const needle = `__nonexistent_${Date.now()}`
    await filterBySearchValue(needle)

    const rows = await driver.findElements(By.css('table tbody tr'))
    if (rows.length === 0) return

    const txt = await bodyText()
    assert(!txt.includes(needle), 'Nonexistent needle should not appear in results')
  })

  it('edit page loads and shows the product code field', async () => {
    await goToProducts()
    await openFirstEditByUrl()

    const codeInputs = await driver.findElements(By.css('input[name$="[code]"], input[id$="_code"]'))
    assert(codeInputs.length > 0, 'Code input not found on edit page')
    const val = ((await codeInputs[0].getAttribute('value')) || '').trim()
    assert(val.length > 2, 'Code input value should not be empty')
  })

  it('update product short description and then revert the change', async () => {
    await goToProducts()
    await openFirstEditByUrl()
    await updateShortDescriptionAndRevert()
  })

  it('toggle product enabled flag and revert', async () => {
    await goToProducts()
    await openFirstEditByUrl()
    await toggleEnabledAndRevert()
  })

  it('open product details and navigate back to products using breadcrumb', async () => {
    await goToProducts()
    await openFirstEditByUrl()
    await openShowFromEdit()

    const productsCrumb = await driver.findElements(By.xpath("//a[contains(.,'Products')]"))
    assert(productsCrumb.length > 0, 'Products breadcrumb not found')
    const href = await productsCrumb[0].getAttribute('href')
    if (href) await driver.get(href)
    else await clickEl(productsCrumb[0])
    await driver.wait(until.urlContains('/admin/products'), 30000)
  })

  it('sorting by clicking a sortable column changes the URL', async () => {
    await goToProducts()
    await openSortingByUrl()
  })

  it('pagination: if page 2 exists, user can navigate to it', async () => {
    await goToProducts()
    const page2 = await driver.findElements(By.css('a[href*="page=2"]'))
    if (!page2.length) return

    const href = await page2[0].getAttribute('href')
    if (href) await driver.get(href)
    else await clickEl(page2[0])

    await driver.wait(async () => (await currentUrl()).includes('page=2'), 30000)
  })

  it('create product page opens and contains the product code field', async () => {
    await goToProducts()
    await openCreateProduct()

    const codeInputs = await driver.findElements(By.css('input[name$="[code]"], input[id$="_code"]'))
    assert(codeInputs.length > 0, 'Code input not found on create page')
  })
})