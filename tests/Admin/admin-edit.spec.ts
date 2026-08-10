import { test, expect } from '../support';
import { ApiCreatedUser } from '../support/api/adminApi';
import { buildUserData } from '../support/data/admin/userController';

test.describe(('Admin - System Users'), () => {

    let createdUser: ApiCreatedUser | undefined;

    test.beforeEach(async ({ login, admin, adminApi }) => {

        createdUser = await adminApi.createUser(buildUserData({ status: 'Enabled' }));

        await login.navigate();
        await admin.open();

    });

    test.afterEach(async ({ adminApi }) => {

        if (createdUser) {
            await adminApi.deleteUserByUsername(createdUser.username);
            createdUser = undefined;
        }

    });

    test('TC103: Editar usuário existente', async ({ admin }) => {

        await admin.editUserStatus(createdUser!.username, 'Disabled');

        await admin.searchByUsername(createdUser!.username);

        await admin.assertUserStatus(createdUser!.username, 'Disabled');

    });

});