import { test, expect } from '@playwright/test';

test.describe('Restaurant Daily Landing Page', () => {
  test('should load homepage and display all sections', async ({ page }) => {
    await page.goto('/');

    // Login Section
    await expect(page.locator('h1')).toContainText('Restaurant Daily');
    await expect(page.locator('text=Simplify your restaurant operations')).toBeVisible();
    await expect(page.locator('img[alt="Restaurant Daily"]').first()).toBeVisible();

    // Primary CTA - Sign in with Phone
    await expect(page.locator('a:has-text("Sign in with Phone")')).toBeVisible();

    // Hero Section - scroll down
    await expect(page.locator('text=Know your numbers.')).toBeVisible();
    await expect(page.locator('text=Every single day.')).toBeVisible();
    await expect(page.locator('text=Real-time cash tracking')).toBeVisible();

    // Dashboard Preview Stats
    await expect(page.locator('text=Cash Sales')).toBeVisible();
    await expect(page.locator('text=UPI/Card')).toBeVisible();

    // Pain Points Section
    await expect(page.locator('text=Sound familiar?')).toBeVisible();
    await expect(page.locator('text=End of day chaos.')).toBeVisible();
    await expect(page.locator('text=Petty cash mess.')).toBeVisible();

    // Solution Section
    await expect(page.locator('text=One dashboard.')).toBeVisible();
    await expect(page.locator('text=Complete control.')).toBeVisible();

    // Features Section
    await expect(page.locator('text=Cash Session Tracking')).toBeVisible();
    await expect(page.locator('text=Payment Reconciliation')).toBeVisible();
    await expect(page.locator('text=Team Management')).toBeVisible();
    await expect(page.locator('text=Daily Reports')).toBeVisible();

    // Early Access Section
    await expect(page.locator('text=Built for Indian Restaurants')).toBeVisible();
    await expect(page.locator('text=Start free today.')).toBeVisible();

    // Social Proof Section
    await expect(page.locator('text=Finally, I know exactly where every rupee goes')).toBeVisible();

    // Footer
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('text=Mindweave Technologies')).toBeVisible();

    // Check page title
    await expect(page).toHaveTitle(/Restaurant Daily/);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Login section should be visible
    await expect(page.locator('h1')).toContainText('Restaurant Daily');
    await expect(page.locator('img[alt="Restaurant Daily"]').first()).toBeVisible();

    // CTA should be visible and clickable
    const cta = page.locator('a:has-text("Sign in with Phone")');
    await expect(cta).toBeVisible();

    // Key sections should be visible on scroll
    await expect(page.locator('text=Know your numbers.')).toBeVisible();

    // Footer should be visible
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // Check Sign in link
    const signInLink = page.locator('a:has-text("Sign in with Phone")');
    await expect(signInLink).toHaveAttribute('href', '/auth/phone');

    // Check Get Started link
    const getStartedLinks = page.locator('a:has-text("Get Started Free")');
    await expect(getStartedLinks.first()).toHaveAttribute('href', '/auth/phone');

    // Check footer links exist
    await expect(page.locator('footer a:has-text("Privacy Policy")')).toBeVisible();
    await expect(page.locator('footer a:has-text("Terms of Service")')).toBeVisible();
  });
});
