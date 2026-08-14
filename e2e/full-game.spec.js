const { test, expect } = require('@playwright/test');

test('host and two players can complete a full Mock-provider game', async ({ browser }) => {
  const roomID = `E2E${Date.now().toString(36)}`;
  const hostContext = await browser.newContext();
  const aliceContext = await browser.newContext();
  const bobContext = await browser.newContext();
  const host = await hostContext.newPage();
  const alice = await aliceContext.newPage();
  const bob = await bobContext.newPage();

  try {
    await Promise.all([
      host.goto(`/host?room=${roomID}`),
      alice.goto(`/?room=${roomID}`),
      bob.goto(`/?room=${roomID}`),
    ]);

    await expect(host.getByRole('heading', { name: 'Admin - lobby' })).toBeVisible();
    await host.getByLabel('Mock').check();

    await alice.getByPlaceholder('Type your name').fill('Alice');
    await alice.getByPlaceholder('Type your name').press('Enter');
    await bob.getByPlaceholder('Type your name').fill('Bob');
    await bob.getByPlaceholder('Type your name').press('Enter');

    await expect(alice.getByRole('heading', { name: 'Thank you, Alice' })).toBeVisible();
    await expect(bob.getByRole('heading', { name: 'Thank you, Bob' })).toBeVisible();
    await expect(host.locator('.admin-debug')).toContainText('Alice');
    await expect(host.locator('.admin-debug')).toContainText('Bob');

    await host.getByRole('button', { name: 'IDEATION' }).click();
    await expect(alice.getByPlaceholder('Type your prompt')).toBeVisible();
    await expect(bob.getByPlaceholder('Type your prompt')).toBeVisible();

    await alice.getByPlaceholder('Type your prompt').fill('Alice robot');
    await alice.getByPlaceholder('Type your prompt').press('Enter');
    await bob.getByPlaceholder('Type your prompt').fill('Bob castle');
    await bob.getByPlaceholder('Type your prompt').press('Enter');

    await expect(alice.getByRole('img', { name: 'Alice robot' })).toBeVisible();
    await expect(bob.getByRole('img', { name: 'Bob castle' })).toBeVisible();

    await host.getByRole('button', { name: 'VOTING' }).click();
    await expect(alice.getByRole('heading', { name: /Choose up to 3 to vote for/ })).toBeVisible();
    await expect(bob.getByRole('heading', { name: /Choose up to 3 to vote for/ })).toBeVisible();

    await alice.getByRole('img', { name: 'Bob castle' }).click();
    await bob.getByRole('img', { name: 'Alice robot' }).click();

    await host.getByRole('button', { name: 'RESULTS' }).click();
    await expect(alice.getByRole('heading', { name: 'Results' })).toBeVisible();
    await expect(bob.getByRole('heading', { name: 'Results' })).toBeVisible();
    await expect(alice.locator('.results')).toContainText('Alice');
    await expect(alice.locator('.results')).toContainText('Bob');
    await expect(alice.locator('.results')).toContainText('1 votes');
  } finally {
    await Promise.all([hostContext.close(), aliceContext.close(), bobContext.close()]);
  }
});
