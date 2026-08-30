import { test, expect } from '../support';
import { ApiCreatedUser } from '../support/api/adminApi';
import { buildUserData } from '../support/data/admin/userController';

test.describe('Admin - Delete Users', { tag: '@admin' }, () => {

    let createdUser: ApiCreatedUser | undefined;

    test.beforeEach(async ({ login, admin, adminApi }) => {

        createdUser = await adminApi.createUser(buildUserData());

        await login.navigate();
        await admin.open();

    });


    test('TC106: Delete existing user', async ({ admin }) => {

        await admin.deleteUserByUsername(createdUser!.username);

        await admin.searchByUsername(createdUser!.username);

        await expect(await admin.getUserRows()).toHaveCount(0);

        createdUser = undefined;

    });

});