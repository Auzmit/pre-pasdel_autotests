import { test, expect, Page } from '@playwright/test';

// before all test we must have user with {
//   login: 'o12o12',
//   E-mail: 'o12o12@mail.ru',
//   Password: 'o12o12'
// }

// after each test, we clean up DB to the point where only our 1st user exists

// to avoid the error that this data has an implicit type of any
interface RegistrationData {
  login: string;
  email: string;
  password: string;
}

// function for Registration
async function fillRegistrationForm (page: Page, { login, email, password }: RegistrationData) {
  await expect(page.getByRole('textbox', { name: 'Логин:' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Логин:' }).fill(login);
  await page.locator('#regEmail').fill(email);
  await page.locator('/html/body/main/section[1]/div[2]/form/div[3]/input').fill(password);
  await page.getByRole('textbox', { name: 'Подтверждение пароля:' }).fill(password);
  await page.getByRole('button', { name: 'Аватар:' }).press('Tab'); // just skip Avatar's input
  await page.getByRole('checkbox', { name: 'Согласен с политикой конфиденциальности' }).check();
  await expect(page.getByRole('button', { name: 'Register' })).toBeEnabled();
  await page.getByRole('button', { name: 'Register' }).click();
}

test('trying registration with duplicate email (different Login, same E-mail)', async ({ page }) => {
  await page.goto('https://pre.pasdel.ru/');
  await fillRegistrationForm(page, {
    login: 'o12',
    email: 'o12o12@mail.ru',
    password: 'o12o12'
  });
  await page.getByRole('button', { name: 'Register' }).click();

  // CHECK
  // registration must not be successful
  const value = await page.locator('#emailCheck').innerText();
  expect(value).toBe('Email уже используется');
});

test('trying registration with duplicate login (same Login, different E-mail)', async ({ page }) => {
  await page.goto('https://pre.pasdel.ru/');
  await fillRegistrationForm(page, {
    login: 'o12o12',
    email: 'o12@mail.ru',
    password: 'o12o12'
  });
  await page.getByRole('button', { name: 'Register' }).click();

  // CHECK
  // registration must not be successful
  const value = await page.locator('#registerSuccess').innerText();
  expect(value).toBe(''); // instead of 'Регистрация успешна! Теперь вы можете войти'
});

// in "Главная"
test.describe('Main Page tab', () => {
  // before every test we simply go to site
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

// in "Личный кабинет"
test.describe('Personal Account tab', () => {
  // before every test we do right Authorization
  test.beforeEach(async ({ page }) => {
    await page.goto('https://pre.pasdel.ru/');

    const loginEmail = page.locator('#loginEmail');
    const loginPassword = page.locator('#loginPassword');
    const authButton = page.getByRole('button', { name: 'Auth' });

    await expect(loginEmail).toBeVisible();
    await loginEmail.fill('o12o12@mail.ru');
    await loginPassword.fill('o12o12');
    await expect(authButton).toBeEnabled();
    await authButton.click();

    await page.waitForURL('https://pre.pasdel.ru/dashboard.php');
    expect(page.url()).toContain('https://pre.pasdel.ru/dashboard.php');
  });

  test('does footer have all 3 info (rights, tel, e-mail)?', async ({ page }) => {
    const footerRights = page.locator('footer div p').first();
    await expect(footerRights).toBeVisible();
    const footerRightsValue = await footerRights.innerText();
    expect(footerRightsValue).toBe('© 2023 QA Тренажер. Все права защищены.');
    const footerTel = page.locator('footer div p a[href^="tel:"]');
    await expect(footerTel).toBeVisible();

    // checking if we have this href have tel number
    await expect(footerTel).toHaveAttribute('href', /tel:/);
    // checking if number in href matches to number in value
    const hrefValue = await footerTel.getAttribute('href');
    const hrefNumber = hrefValue?.replace('tel:', '');
    const textNumber = (await footerTel.innerText()).replace(/[^\d+]/g, ''); // only numbers
    expect(textNumber).toContain(hrefNumber);
  });

  test('does word "ЗарегИстрировано" (not "Е") writed rigthly?', async ({ page }) => {
    const h3Element = page.locator('section.dashboard-section .stats-container .stat-card h3');
    await expect(h3Element).toBeVisible();
    expect(await h3Element.innerText()).toBe('Зарегистрировано пользователей');
  });

  test('does tab "Главная" exist in the header menu?', async ({ page }) => {
    // does menu bar have 4 tabs?
    const navItems = page.locator('header nav ul > li');
    await expect(navItems).toHaveCount(4);
    // does 1-st tab's value is "Главная"?
    const firstTab = navItems.first();
    await expect(firstTab).toBeVisible();
    expect(await firstTab.getAttribute('value')).toBe('Главная');
  });

  test('does logout tab "Выход" loads main page?', async ({ page }) => {
    // CHECK
    const logoutLink = page.getByRole('link', { name: 'Выход' });
    await expect(logoutLink).toBeVisible();
    await logoutLink.click();
    await page.waitForURL('https://pre.pasdel.ru/index.php');
    expect(page.url()).toContain('https://pre.pasdel.ru/index.php');
  });
});
