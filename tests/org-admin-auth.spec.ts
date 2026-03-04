import { test, expect } from '@playwright/test';
import { testConfig, phoneDigitsOnly } from './test-config';

test.describe('Org Admin Authentication Flow', () => {
  test('should navigate to phone auth page', async ({ page }) => {
    await page.goto(testConfig.urls.home);

    // Click sign in with phone
    await page.click('a:has-text("Sign in with Phone")');

    // Should be on auth/phone page
    await expect(page).toHaveURL(/\/auth\/phone/);
    await expect(page.locator('text=Enter your phone number')).toBeVisible();
  });

  test('should enter org admin phone number', async ({ page }) => {
    await page.goto(testConfig.urls.authPhone);

    // Enter phone number
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill(phoneDigitsOnly(testConfig.orgAdmin.phone));

    // Verify input value
    await expect(phoneInput).toHaveValue(phoneDigitsOnly(testConfig.orgAdmin.phone));
  });

  // This test requires manual OTP entry or OTP bypass for automation
  test.skip('should complete full auth flow with OTP', async ({ page }) => {
    await page.goto(testConfig.urls.authPhone);

    // Enter phone number
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill(phoneDigitsOnly(testConfig.orgAdmin.phone));

    // Click send OTP
    await page.click('button:has-text("Send OTP")');

    // Wait for OTP page
    await expect(page).toHaveURL(/\/auth\/verify/, {
      timeout: testConfig.timeouts.otpDelivery,
    });

    // Manual step: Enter OTP received on phone
    // For automated testing, implement OTP retrieval or use test mode
    console.log(`OTP sent to ${testConfig.orgAdmin.phone}`);
    console.log('Enter OTP manually or implement OTP retrieval');
  });
});

test.describe('Org Admin Dashboard Access', () => {
  // These tests assume user is already authenticated
  // Use test fixtures or session storage for auth state

  test.skip('should access admin dashboard when authenticated', async ({ page }) => {
    // This requires authenticated session
    await page.goto(testConfig.urls.adminDashboard);
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });
});
