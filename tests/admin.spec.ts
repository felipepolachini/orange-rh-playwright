import { test, expect } from './support';

test.describe(() =>{
        test('TC-01: View user list', async ({ login, admin }) => {

        await login.navigate();

        await admin.open();

        await admin.searchMenuItem('Admin');

        await expect(await admin.getUserRows()).not.toHaveCount(0);

        await admin.getRecordCount(await (await admin.getUserRows()).count());

    });
})

