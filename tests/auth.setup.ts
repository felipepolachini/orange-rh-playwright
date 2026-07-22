import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './support/actions/login';

const authFile = 'playwright/.auth/admin.json';

setup('Authenticate', async ({ page }) => {

    const login = new LoginPage(page);

    await login.navigate();

    await login.login(
        'Admin',
        'admin123'
    );

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Dashboard').first()).toBeVisible();

    await page.context().storageState({
        path: authFile,
    });

});