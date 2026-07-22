import { test } from '@playwright/test';
import { AdminPage } from './support/actions/admin';

test('Should search user by username', async ({ page }) => {

    console.log(await page.context().storageState());

    //await page.goto('/web/index.php/dashboard/index');

    console.log(await page.url());

    await page.pause();

    const adminPage = new AdminPage(page);

    await adminPage.open();

    await adminPage.searchUser('Admin');

    await adminPage.expectUserExists('Admin');

});