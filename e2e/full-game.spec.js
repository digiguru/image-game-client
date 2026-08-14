import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function expectAccessible(page, label) {
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();

  const summary = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.flatMap((node) => node.target),
  }));

  expect(summary, `${label} accessibility violations`).toEqual([]);
}

test('host and two players can complete an accessible full Mock-provider game', async ({ browser }) => {
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
    await expectAccessible(host, 'host lobby');
    await host.getByLabel('Mock').check();

    await alice.getByRole('textbox', { name: 'Your name' }).fill('Alice');
    await alice.getByRole('button', { name: 'Join game' }).click();
    await bob.getByRole('textbox', { name: 'Your name' }).fill('Bob');
    await bob.getByRole('button', { name: 'Join game' }).click();

    await expect(alice.getByRole('heading', { name: 'Thank you, Alice' })).toBeVisible();
    await expect(bob.getByRole('heading', { name: 'Thank you, Bob' })).toBeVisible();
    await expect(host.locator('.admin-debug')).toContainText('Alice');
    await expect(host.locator('.admin-debug')).toContainText('Bob');
    await expectAccessible(alice, 'player lobby');

    await host.getByRole('button', { name: 'IDEATION' }).click();
    await expect(alice.getByRole('textbox', { name: 'Image prompt' })).toBeVisible();
    await expect(bob.getByRole('textbox', { name: 'Image prompt' })).toBeVisible();
    await expectAccessible(alice, 'ideation');

    await alice.getByRole('textbox', { name: 'Image prompt' }).fill('Alice robot');
    await alice.getByRole('button', { name: 'Create image' }).click();
    await bob.getByRole('textbox', { name: 'Image prompt' }).fill('Bob castle');
    await bob.getByRole('button', { name: 'Create image' }).click();

    await expect(alice.getByRole('img', { name: 'Alice robot' })).toBeVisible();
    await expect(bob.getByRole('img', { name: 'Bob castle' })).toBeVisible();

    await host.getByRole('button', { name: 'VOTING' }).click();
    await expect(alice.getByRole('heading', { name: 'Choose up to 3 images to vote for' })).toBeVisible();
    await expect(bob.getByRole('heading', { name: 'Choose up to 3 images to vote for' })).toBeVisible();
    await expectAccessible(alice, 'voting');

    await alice.getByRole('button', { name: 'Vote for Bob castle' }).click();
    await bob.getByRole('button', { name: 'Vote for Alice robot' }).click();

    await host.getByRole('button', { name: 'RESULTS' }).click();
    await expect(alice.getByRole('heading', { name: 'Results' })).toBeVisible();
    await expect(bob.getByRole('heading', { name: 'Results' })).toBeVisible();
    await expect(alice.locator('.results')).toContainText('Alice');
    await expect(alice.locator('.results')).toContainText('Bob');
    await expect(alice.locator('.results')).toContainText('1 votes');
    await expectAccessible(alice, 'results');
  } finally {
    await Promise.all([hostContext.close(), aliceContext.close(), bobContext.close()]);
  }
});
