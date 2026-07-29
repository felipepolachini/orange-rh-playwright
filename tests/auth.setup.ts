import { test as setup, expect } from './support';


setup('Authenticate', async ({ page, login, dashboard }) => {
   
    const storageState = process.env.STORAGE_STATE_PATH
    const username = process.env.ADMIN_USERNAME ?? 'Admin';
    const password = process.env.ADMIN_PASSWORD ?? 'admin123';

    await login.navigate();
    await login.waitUntilLoaded();

    await login.login(
        username,
        password
    );

    await dashboard.waitUntilLoaded();


    await page.context().storageState({
        path: storageState as string 
    });

});