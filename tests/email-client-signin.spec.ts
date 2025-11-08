import { test, expect } from '@playwright/test';

/**
 * Email Client Sign-in Test Suite
 * Tests the sign-in functionality and verifies email menu availability
 */

test.describe('Email Client Sign-in Tests', () => {
  // Test configuration - update these values for your specific email client
  const EMAIL_CLIENT_URL = 'https://www.seznam.cz'; // Replace with your email client URL
  const TEST_EMAIL = 'testingEmail12345@seznam.cz'; // Replace with test email
  const TEST_PASSWORD = ''; // Replace with test password

  test.beforeEach(async ({context,  page }) => {
    // Navigate to the email client login page before each test
    await page.goto(EMAIL_CLIENT_URL);
    // Click the link that opens in a new window
      const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.locator('a[href="https://email.seznam.cz/?hp#inbox"]:has-text("Přihlásit")').click()
  ]);

  // Grant permissions and bring focus to the new page
  await newPage.bringToFront();

  const loginInput = newPage.locator('#login-username');
  await loginInput.fill(TEST_EMAIL);

  await newPage.locator('button[type="submit"][data-locale="login.submit"]:has-text("Continue")').click();


  const passwordInput = newPage.locator('#login-password');
  await passwordInput.fill(TEST_PASSWORD);

  await newPage.locator('button[type="submit"][data-locale="login.submit"][data-arrow-down="#login-username"]').click();

  });

  test('Check the mail page and see check that mail menu items exist', async ({ context, page }) => {


    await page.waitForTimeout(2000);

    const logInButton = page.locator('a[href="https://email.seznam.cz/?hp#inbox"]:has-text("Přihlásit")');
    await expect(logInButton).not.toBeVisible({ timeout: 10000 });


    // Step 1: Verify successful sign-in by checking for email menu/navigation
    // Common selectors for email client menus - adjust based on your client
    const toEmailButton = page.locator('a[href="https://email.seznam.cz/?hp"][ga-destination-site="email.seznam.cz"][ga-destination-url="https://email.seznam.cz/?hp"]').first();
    await expect(toEmailButton).toBeVisible({ timeout: 10000 });
    await toEmailButton.click();

    // Wait for the network to be idle
    await page.waitForLoadState('networkidle');

    const emailMenu = page.getByRole('navigation').first();
    await expect(emailMenu).toBeVisible({ timeout: 10000 });

    const linkToDelivered = page.locator('a').locator('span:has-text("Doručené")');
    await expect(linkToDelivered).toBeVisible();
    linkToDelivered.click();

    const linkToSent = page.getByTitle('Odeslané');
    await expect(linkToSent).toBeVisible();
    linkToSent.click();

    const linkToConcepts = page.locator('a[title="Rozepsané"]');
    await expect(linkToConcepts).toBeVisible();
    linkToConcepts.click();

    const linkToMass = page.locator('a[title*="Hromadné"]');
    await expect(linkToMass).toBeVisible();
    linkToMass.click();
  });

  test('Test Log out', async ({ page }) => {
    const avatar = page.locator('szn-avatar').first();
    await avatar.click();

    const logInButton = page.locator('a[href="https://email.seznam.cz/?hp#inbox"]:has-text("Přihlásit")');
    await expect(logInButton).not.toBeVisible({ timeout: 10000 });

    const logoutButton = page.locator('szn-login-menu').locator('a[data-action="logout"]');
    await expect(logoutButton).toBeVisible();
    logoutButton.click();

    await expect(logInButton).toBeVisible({ timeout: 10000 });
  });

  test.skip('should verify email menu contains expected items after sign-in', async ({ page }) => {
    // Sign in
    await page.locator('input[type="email"], input[name="email"], input[id="email"]').first().fill(TEST_EMAIL);
    await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /přihlásit/i }).click();
    
    await page.waitForLoadState('networkidle');

    // Verify all expected menu items are present
    const expectedMenuItems = ['Inbox', 'Sent', 'Drafts', 'Trash', 'Spam'];
    
    for (const item of expectedMenuItems) {
      const menuItem = page.getByRole('link', { name: new RegExp(item, 'i') })
        .or(page.getByText(new RegExp(item, 'i')));
      
      // Check if at least one matching element is visible
      await expect(menuItem.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test.skip('should be able to navigate between email menu items', async ({ page }) => {
    // Sign in
    await page.locator('input[type="email"], input[name="email"], input[id="email"]').first().fill(TEST_EMAIL);
    await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /přihlásit/i }).click();
    
    await page.waitForLoadState('networkidle');

    // Click on Inbox
    const inboxLink = page.getByRole('link', { name: /inbox/i }).first();
    await inboxLink.click();
    await expect(page).toHaveURL(/inbox/i);

    // Click on Sent
    const sentLink = page.getByRole('link', { name: /sent/i }).first();
    await sentLink.click();
    await expect(page).toHaveURL(/sent/i);

    // Click on Drafts
    const draftsLink = page.getByRole('link', { name: /draft/i }).first();
    await draftsLink.click();
    await expect(page).toHaveURL(/draft/i);
  });
});
