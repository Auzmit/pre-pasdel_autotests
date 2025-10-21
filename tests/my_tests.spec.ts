import { test, expect } from '@playwright/test';

// как проверить наличие этого уведомления, которое даже не является элементом HTML-разметки:
// "адрес электронной почты должен быть..."?

// before all test we must have user with {
//   login: 'o12o12',
//   E-mail: 'o12o12@mail.ru',
//   Password: 'o12o12'
// }

// after each test, we clean up DB to the point where only our 1st user exists

test('wrong registration (different Login, same E-mail)', async ({ page }) => {
  await page.goto('https://pre.pasdel.ru/');

  // Login
  await page.getByRole('textbox', { name: 'Логин:' }).click();
  await page.getByRole('textbox', { name: 'Логин:' }).fill('o12');
  await page.getByRole('textbox', { name: 'Логин:' }).press('Tab');  
  // E-mail
  await page.locator('#regEmail').fill('o12o12@mail.ru');
  await page.locator('#regPassword').click();
  // Password
  await page.locator('#regPassword').fill('o12o12');
  await page.locator('#regPassword').press('Tab');
  // Password confirm
  await page.getByRole('textbox', { name: 'Подтверждение пароля:' }).fill('o12o12');
  await page.getByRole('textbox', { name: 'Подтверждение пароля:' }).press('Tab');
  // Avatar skip
  await page.getByRole('button', { name: 'Аватар:' }).press('Tab');
  // Agreement checkbox
  await page.getByRole('checkbox', { name: 'Согласен с политикой конфиденциальности' }).check();
  await page.getByRole('checkbox', { name: 'Согласен с политикой конфиденциальности' }).press('Tab');
  // Register button
  await page.getByRole('button', { name: 'Register' }).click();

  // CHECK
  // registration must not be successful
  const value = await page.locator('#emailCheck').innerText();
  expect(value).toBe('Email уже используется');
});

test('wrong registration (same Login, different E-mail)', async ({ page }) => {
  await page.goto('https://pre.pasdel.ru/');

  // Login
  await page.getByRole('textbox', { name: 'Логин:' }).click();
  await page.getByRole('textbox', { name: 'Логин:' }).fill('o12o12');
  await page.getByRole('textbox', { name: 'Логин:' }).press('Tab');  
  // E-mail
  await page.locator('#regEmail').fill('o12@mail.ru');
  await page.locator('#regPassword').click();
  // Password
  await page.locator('#regPassword').fill('o12o12');
  await page.locator('#regPassword').press('Tab');
  // Password confirm
  await page.getByRole('textbox', { name: 'Подтверждение пароля:' }).fill('o12o12');
  await page.getByRole('textbox', { name: 'Подтверждение пароля:' }).press('Tab');
  // Avatar skip
  await page.getByRole('button', { name: 'Аватар:' }).press('Tab');
  // Agreement checkbox
  await page.getByRole('checkbox', { name: 'Согласен с политикой конфиденциальности' }).check();
  await page.getByRole('checkbox', { name: 'Согласен с политикой конфиденциальности' }).press('Tab');
  // Register button
  await page.getByRole('button', { name: 'Register' }).click();

  // CHECK
  // registration must not be successful
  const value = await page.locator('#registerSuccess').innerText();
  expect(value).toBe(''); // instead of 'Регистрация успешна! Теперь вы можете войти'
});

// in "Главная"
test.describe('in "Главная". Before every test we just go to site', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://pre.pasdel.ru/');
  });

  test('does footer have all 3 info (rights, tel, e-mail)?', async ({ page }) => {
    // CHECK
    const footerRights = page.locator('xpath=/html/body/footer/div/p[1]');
    await expect(footerRights).toBeVisible();
    const footerRightsValue = await footerRights.innerText();
    expect(footerRightsValue).toBe('© 2023 QA Тренажер. Все права защищены.'); // not "защЕщены"

    const footerTel = page.locator('xpath=/html/body/footer/div/p[2]/a');
    await expect(footerTel).toBeVisible();
    // checking if we have this href have tel number
    await expect(footerTel).toHaveAttribute('href', /tel:/);
    // checking if number in href matches to number in value
    const hrefValue = await footerTel.getAttribute('href');
    const hrefNumber = hrefValue?.replace('tel:', '');
    const textContent = await footerTel.innerText();
    const textNumber = textContent.replace(/[^\d+]/g, '');
    expect(textNumber).toContain(hrefNumber);

    const footerEmail = page.locator('xpath=/html/body/footer/div/p[3]');
    await expect(footerEmail).toBeVisible();
    const footerEmailValue = await footerEmail.innerText();
    expect(footerEmailValue).toBe('info@qa-train.ru');
  });

  test('does buttons Reg and Auth writted in rus?', async ({ page }) => {
    // CHECK
    // Auth button
    const buttonAuth = page.locator('xpath=/html/body/main/section[1]/div[1]/form/button');
    await expect(buttonAuth).toBeVisible();
    const buttonAuthValue = await buttonAuth.innerText();
    expect(buttonAuthValue).toBe('Авторизация');

    // Reg button
    const buttonReg = page.locator('xpath=/html/body/main/section[1]/div[2]/form/button');
    await expect(buttonReg).toBeVisible();
    const buttonRegValue = await buttonReg.innerText();
    expect(buttonRegValue).toBe('Регистрация');
  });

  test('is there a vertical gap between Header and Forms section?', async ({ page }) => {
    // CHECK
    const headerLocator = page.locator('header');
    await expect(headerLocator).toBeVisible();
    const headerElement = await headerLocator.boundingBox();

    const formsSectionLocator = page.locator('section.auth-section');
    await expect(formsSectionLocator).toBeVisible();
    const formsSectionElement = await formsSectionLocator.boundingBox();

    if (headerElement && formsSectionElement) {
      const verticalGap = formsSectionElement.y - (headerElement.y + headerElement.height);
      expect(verticalGap).toBeGreaterThan(0);
      expect(verticalGap).toBe(32); // between Footer and Comments section we have 2rem = 32px, here we must have same value
    } else throw new Error('Required elements (headerElement or formsSectionElement) not found on the page');
  });
});

test('right Auth', async ({ page }) => {
  await page.goto('https://pre.pasdel.ru/');
  // E-mail
  await page.locator('#loginEmail').click();
  await page.locator('#loginEmail').fill('o12o12@mail.ru');
  await page.locator('#loginEmail').press('Tab');
  // Password
  await page.locator('#loginPassword').fill('o12o12');
  await page.locator('#loginPassword').press('Tab');
  // Auth button
  await page.getByRole('button', { name: 'Auth' }).click();

  // CHECK
  const waitForUrlPromise = page.waitForURL('https://pre.pasdel.ru/dashboard.php');
  await waitForUrlPromise;
  expect(page.url()).toContain('https://pre.pasdel.ru/dashboard.php');
});

test.describe('in "Личный кабинет". Before every test we do auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://pre.pasdel.ru/');
    // E-mail
    await page.locator('#loginEmail').click();
    await page.locator('#loginEmail').fill('o12o12@mail.ru');
    await page.locator('#loginEmail').press('Tab');
    // Password
    await page.locator('#loginPassword').fill('o12o12');
    await page.locator('#loginPassword').press('Tab');
    // Auth button
    await page.getByRole('button', { name: 'Auth' }).click();
    const waitForUrlPromise = page.waitForURL('https://pre.pasdel.ru/dashboard.php');
    await waitForUrlPromise;
    expect(page.url()).toContain('https://pre.pasdel.ru/dashboard.php');
  });

  test('does footer have all 3 info (rights, tel, e-mail)?', async ({ page }) => {
    const footerRights = page.locator('xpath=/html/body/footer/div/p[1]');
    await expect(footerRights).toBeVisible();
    const footerRightsValue = await footerRights.innerText();
    expect(footerRightsValue).toBe('© 2023 QA Тренажер. Все права защищены.');

    const footerTel = page.locator('xpath=/html/body/footer/div/p[2]/a');
    await expect(footerTel).toBeVisible();
    // checking if we have this href have tel number
    await expect(footerTel).toHaveAttribute('href', /tel:/);
    // checking if number in href matches to number in value
    const hrefValue = await footerTel.getAttribute('href');
    const hrefNumber = hrefValue?.replace('tel:', '');
    const textContent = await footerTel.innerText();
    const textNumber = textContent.replace(/[^\d+]/g, '');
    expect(textNumber).toContain(hrefNumber);
  });

  test('does word "ЗарегИстрировано" (not "Е") writed rigthly?', async ({ page }) => {
    const h3Element = page.locator('section.dashboard-section .stats-container .stat-card h3');
    const h3ElementValue = await h3Element.innerText();
    expect(h3ElementValue).toBe('Зарегистрировано пользователей');
  });

  test('does tab "Главная" exist in the header menu?', async ({ page }) => {
    // does menu bar have 4 tabs?
    const navUl = page.locator('header nav ul > li');
    await expect(navUl).toHaveCount(4);
    // does 1-st tab's value is "Главная"?
    const value = await navUl.first().getAttribute('value');
    expect(value).toBe('Главная');
    // does this tab visible?
    await expect(page.locator('ul > li[value="Главная"]').first()).toBeVisible();
  });

  test('does logout tab "Выход" loads main page?', async ({ page }) => {
    // CHECK
    const logoutLink = page.getByRole('link', { name: 'Выход' });
    await expect(logoutLink).toBeVisible();
    await logoutLink.click();
    const waitForUrlPromise = page.waitForURL('https://pre.pasdel.ru/index.php');
    await waitForUrlPromise;
    expect(page.url()).toContain('https://pre.pasdel.ru/index.php');
  });
});
