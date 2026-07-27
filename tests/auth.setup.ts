import { test as setup, expect, FullConfig  } from '@playwright/test';
import { LoginPage } from './support/actions/login';


setup('Authenticate', async ({ page }, testInfo: { config: FullConfig }) => {

    const login = new LoginPage(page);

    const storageState = process.env.STORAGE_STATE_PATH
    const username = process.env.ADMIN_USERNAME ?? 'Admin';
    const password = process.env.ADMIN_PASSWORD ?? 'admin123';

    await login.navigate();
    await login.waitUntilLoaded();

    await login.login(
        username,
        password
    );

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Dashboard').first()).toBeVisible();

    await page.context().storageState({
        path: storageState as string 
    });

});