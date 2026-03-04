import { test, expect } from '@playwright/test';
import { testConfig } from './test-config';

/**
 * Complete Authentication Flow Test
 *
 * Tests the full auth journey: phone → OTP → verify → role-selection
 *
 * IMPORTANT: This test sends REAL SMS via Twilio!
 * - OTP will be sent to the configured phone number
 * - Check server logs for OTP code: tail -f .app.log | grep OTP
 * - Rate limit: 20 OTPs per hour per phone number
 *
 * Run: npm run test -- tests/auth-flow.spec.ts
 * Run with UI: npm run test:ui -- tests/auth-flow.spec.ts
 * Run headed: npm run test:headed -- tests/auth-flow.spec.ts
 */

// Increase timeout for auth flow tests (need time for OTP SMS delivery)
test.setTimeout(60000);

test.describe('Complete Auth Flow', () => {
  // Use serial mode - tests depend on each other
  test.describe.configure({ mode: 'serial' });

  test('Step 1: Phone page loads correctly', async ({ page }) => {
    await page.goto('/auth/phone', { timeout: 30000 });

    // Verify page elements
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    await expect(page.locator('text=Enter your phone number')).toBeVisible();
    await expect(page.getByTestId('phone-input')).toBeVisible();
    await expect(page.getByTestId('send-otp-button')).toBeDisabled();

    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/01-phone-page.png', fullPage: true });
  });

  test('Step 2: Phone validation works', async ({ page }) => {
    await page.goto('/auth/phone', { timeout: 30000 });

    // Enter valid phone number
    await page.getByTestId('phone-input').fill(testConfig.orgAdmin.phoneLocal);

    // Button should be enabled after valid input
    await expect(page.getByTestId('send-otp-button')).toBeEnabled();

    // Should show validation message
    await expect(page.locator('text=Valid number')).toBeVisible();

    await page.screenshot({ path: 'test-screenshots/02-phone-validated.png', fullPage: true });
  });

  test.skip('Step 3: OTP request and verify page (SENDS REAL SMS)', async ({ page }) => {
    // This test SENDS REAL SMS via Twilio - skipped by default to avoid rate limits
    // Run with: npm run test:headed -- tests/auth-flow.spec.ts -g "SENDS REAL SMS"
    await page.goto('/auth/phone', { timeout: 30000 });

    // Enter phone and request OTP
    await page.getByTestId('phone-input').fill(testConfig.orgAdmin.phoneLocal);
    await page.getByTestId('send-otp-button').click();

    // Should redirect to verify page
    await expect(page).toHaveURL(/\/auth\/verify/, { timeout: testConfig.timeouts.otpDelivery });

    // Verify page elements
    await expect(page.locator('text=Enter Verification Code')).toBeVisible();
    await expect(page.locator('text=Code expires in')).toBeVisible();

    await page.screenshot({ path: 'test-screenshots/03-verify-page.png', fullPage: true });

    // Log instruction for manual OTP entry
    console.log('\n📱 OTP SENT! Check your phone or server logs:');
    console.log('   tail -f .app.log | grep "OTP generated"');
    console.log(`   Phone: ${testConfig.orgAdmin.phone}\n`);
  });

  /**
   * Full flow test - requires manual OTP entry or log monitoring
   *
   * To run this test:
   * 1. Start the app: ./start_app.sh
   * 2. Watch logs in another terminal: ./logs_app.sh
   * 3. Run test: npm run test:headed -- tests/auth-flow.spec.ts -g "complete"
   * 4. Enter OTP from logs when prompted (or check SMS)
   */
  test.skip('Step 4: Complete flow with OTP entry (MANUAL)', async ({ page }) => {
    // This test is SKIPPED by default - requires manual OTP entry
    // Run with: npm run test:headed -- tests/auth-flow.spec.ts -g "MANUAL"

    await page.goto('/auth/phone', { timeout: 30000 });

    // Enter phone and request OTP
    await page.getByTestId('phone-input').fill(testConfig.orgAdmin.phoneLocal);
    await page.screenshot({ path: 'test-screenshots/04a-phone-entered.png' });

    await page.getByTestId('send-otp-button').click();

    // Wait for verify page
    await expect(page).toHaveURL(/\/auth\/verify/, { timeout: testConfig.timeouts.otpDelivery });
    await page.screenshot({ path: 'test-screenshots/04b-verify-page.png' });

    console.log('\n🔐 ENTER OTP FROM LOGS OR SMS:');
    console.log('   Check: tail -f .app.log | grep "OTP generated"');

    // Wait for user to enter OTP (longer timeout for manual entry)
    // The OTP input auto-advances and submits when complete
    await page.waitForURL(/\/auth\/role-selection/, {
      timeout: 120000 // 2 minutes for manual entry
    });

    await page.screenshot({ path: 'test-screenshots/04c-role-selection.png', fullPage: true });

    // Verify role selection page
    await expect(page.locator('text=Welcome to Restaurant Daily!')).toBeVisible();
    await expect(page.locator('text=Restaurant Admin')).toBeVisible();
    await expect(page.locator('text=Staff Member')).toBeVisible();
  });

  test('Step 5: Role selection UI', async ({ page }) => {
    // This test uses a mock auth state to test role selection UI
    // In real flow, user would arrive here after OTP verification

    // Set mock auth token to bypass redirect
    await page.goto('/auth/phone', { timeout: 30000 });
    await page.evaluate(() => {
      // Create a mock JWT token for testing (expires in 24h)
      const mockPayload = {
        phone: '+918826175074',
        role: 'user',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400
      };
      const mockToken = 'eyJ' + btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
                        btoa(JSON.stringify(mockPayload)) + '.mock-signature';
      localStorage.setItem('auth_token', mockToken);
    });

    await page.goto('/auth/role-selection');
    await page.waitForLoadState('networkidle');

    // Should show role selection (not redirect to login)
    await expect(page.locator('text=Welcome to Restaurant Daily!')).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-screenshots/05a-role-selection-initial.png', fullPage: true });

    // Click Restaurant Admin card (by clicking the heading)
    await page.locator('h3:has-text("Restaurant Admin")').click();
    await expect(page.locator('text=Selected')).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue as Admin/ })).toBeEnabled();

    await page.screenshot({ path: 'test-screenshots/05b-admin-selected.png', fullPage: true });

    // Click Staff Member card
    await page.locator('h3:has-text("Staff Member")').click();

    // Wait for UI to update
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: /Continue as Staff Member/ })).toBeEnabled({ timeout: 5000 });

    await page.screenshot({ path: 'test-screenshots/05c-staff-selected.png', fullPage: true });
  });

  test.skip('Step 6: Role selection requires invitation (MANUAL)', async ({ page }) => {
    // This test is SKIPPED - requires real auth to test API response
    // Set mock auth token
    await page.goto('/auth/phone', { timeout: 30000 });
    await page.evaluate(() => {
      const mockPayload = {
        phone: '+918826175074',
        role: 'user',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400
      };
      const mockToken = 'eyJ' + btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
                        btoa(JSON.stringify(mockPayload)) + '.mock-signature';
      localStorage.setItem('auth_token', mockToken);
    });

    await page.goto('/auth/role-selection');
    await page.waitForLoadState('networkidle');

    // Select admin role and try to continue
    await page.click('text=Restaurant Admin');
    await page.getByRole('button', { name: /Continue as Admin/ }).click();

    // Should show invitation required error
    await expect(page.locator('text=invitation to register')).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-screenshots/06-invitation-required.png', fullPage: true });
  });
});

test.describe('Demo Login', () => {
  test('Demo login button appears in development mode', async ({ page }) => {
    await page.goto('/auth/phone', { timeout: 30000 });

    // Demo login section should be visible in development
    await expect(page.locator('text=Demo Mode')).toBeVisible();
    await expect(page.locator('text=Skip OTP verification for testing')).toBeVisible();
    await expect(page.getByRole('button', { name: /Demo Login/ })).toBeVisible();

    await page.screenshot({ path: 'test-screenshots/demo-login-button.png', fullPage: true });
  });

  test('Demo login bypasses OTP and redirects to role selection', async ({ page }) => {
    await page.goto('/auth/phone', { timeout: 30000 });

    // Wait for demo login button to be visible
    await expect(page.getByRole('button', { name: /Demo Login/ })).toBeVisible();

    // Click demo login button
    await page.getByRole('button', { name: /Demo Login/ }).click();

    // Wait for navigation (API call + redirect)
    await page.waitForURL(/\/auth\/role-selection/, { timeout: 15000 });

    // Should show role selection page
    await expect(page.locator('text=Welcome to Restaurant Daily!')).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-screenshots/demo-login-success.png', fullPage: true });
  });
});

test.describe('Auth Page Responsiveness', () => {

  test('Phone page mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto('/auth/phone', { timeout: 30000 });

    await expect(page.locator('text=Welcome Back')).toBeVisible();
    await page.screenshot({ path: 'test-screenshots/mobile-phone-page.png', fullPage: true });
  });

  test('Verify page mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    // Set session storage to allow verify page access
    await page.goto('/auth/phone', { timeout: 30000 });
    await page.evaluate(() => {
      sessionStorage.setItem('pendingPhone', '+918826175074');
    });
    await page.goto('/auth/verify', { timeout: 30000 });

    await expect(page.locator('text=Enter Verification Code')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-screenshots/mobile-verify-page.png', fullPage: true });
  });
});
