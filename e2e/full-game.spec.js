import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const PHASE_BANNER_COLOURS = {
  lobby: 'rgb(36, 87, 197)',
  ideation: 'rgb(124, 58, 237)',
  voting: 'rgb(217, 119, 6)',
  results: 'rgb(21, 128, 61)',
};

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

async function expectBannerColour(page, phase) {
  await expect.poll(
    () => page.locator('.app-header').evaluate(
      (element) => element.ownerDocument.defaultView.getComputedStyle(element).backgroundColor,
    ),
    { message: `${phase} banner should match the game phase colour` },
  ).toBe(PHASE_BANNER_COLOURS[phase]);
}

test('server dashboard creates a slug, keeps its page open, remembers the game and opens phase shortcuts', async ({ browser }) => {
  const context = await browser.newContext();
  const dashboard = await context.newPage();

  try {
    await dashboard.goto('http://127.0.0.1:3000/');
    await expect(dashboard.getByRole('heading', { name: 'Image Game Server' })).toBeVisible();

    const hostPagePromise = context.waitForEvent('page');
    await dashboard.getByRole('button', { name: 'Start new game' }).click();
    const host = await hostPagePromise;

    const status = dashboard.getByRole('status');
    await expect(status).toContainText(/Game [A-F0-9]{8} created in the lobby/);
    const statusText = await status.textContent();
    const roomID = statusText.match(/[A-F0-9]{8}/)?.[0];
    expect(roomID).toBeTruthy();

    await expect(dashboard).toHaveURL('http://127.0.0.1:3000/');
    await expect(dashboard.getByRole('combobox', { name: 'Game' })).toHaveValue(roomID);

    await host.waitForLoadState('domcontentloaded');
    await expect(host).toHaveURL(new RegExp(`/host\\?room=${roomID}$`));
    await expect(host.getByText(roomID)).toBeVisible();
    await expect(host.getByRole('heading', { name: 'Admin - lobby' })).toBeVisible();
    await expectBannerColour(host, 'lobby');

    await dashboard.getByRole('button', { name: 'Open game details' }).click();
    await expect(dashboard).toHaveURL(`http://127.0.0.1:3000/room/${roomID}`);
    await expect(dashboard.getByRole('heading', { name: `Game ${roomID}` })).toBeVisible();
    await expect(dashboard.getByRole('heading', { name: 'Players & images' })).toBeVisible();

    const phasePagePromise = context.waitForEvent('page');
    await dashboard.getByRole('link', { name: 'Ideation' }).click();
    const ideationHost = await phasePagePromise;
    await ideationHost.waitForLoadState('domcontentloaded');

    await expect(ideationHost.getByRole('heading', { name: 'Admin - ideation' })).toBeVisible();
    await expectBannerColour(ideationHost, 'ideation');
    await expect(ideationHost).toHaveURL(new RegExp(`/host\\?room=${roomID}$`));
    await expect(dashboard).toHaveURL(`http://127.0.0.1:3000/room/${roomID}`);
  } finally {
    await context.close();
  }
});

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
    await expectBannerColour(host, 'lobby');
    await expectBannerColour(alice, 'lobby');
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
    await expectBannerColour(host, 'ideation');
    await expectBannerColour(alice, 'ideation');
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
    await expectBannerColour(host, 'voting');
    await expectBannerColour(alice, 'voting');
    await expectAccessible(alice, 'voting');

    await alice.getByRole('button', { name: 'Vote for Bob castle' }).click();
    await bob.getByRole('button', { name: 'Vote for Alice robot' }).click();

    await host.getByRole('button', { name: 'RESULTS' }).click();
    await expect(alice.getByRole('heading', { name: 'Results' })).toBeVisible();
    await expect(bob.getByRole('heading', { name: 'Results' })).toBeVisible();
    await expectBannerColour(host, 'results');
    await expectBannerColour(alice, 'results');
    await expect(alice.locator('.results')).toContainText('Alice');
    await expect(alice.locator('.results')).toContainText('Bob');
    await expect(alice.locator('.results')).toContainText('1 votes');
    await expectAccessible(alice, 'results');
  } finally {
    await Promise.all([hostContext.close(), aliceContext.close(), bobContext.close()]);
  }
});