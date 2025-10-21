## Some Playwright commands
<br>
Runs the end-to-end tests:

```
npx playwright test
```

<br>
Starts the interactive UI mode:

```
npx playwright test --ui
```

<br>

Runs the tests only on Desktop Chrome:

```
npx playwright test --project=chromium
```

<br>
Runs the tests in a specific file:

```
npx playwright test example
```

<br>
Runs the tests in debug mode:

```
npx playwright test --debug
```

<br>
Auto generate tests with Codegen:

```
npx playwright codegen https://pre.pasdel.ru/
```