import { test, expect } from '../support';
import { ApiCreatedUser } from '../support/api/adminApi';
import { buildUserData } from '../support/data/admin/userController';

test.describe('Admin - Edit Users', { tag: '@admin' }, () => {

    let createdUser: ApiCreatedUser | undefined;

    test.beforeEach(async ({ login, admin, adminApi }) => {

        createdUser = await adminApi.createUser(buildUserData({ status: 'Enabled', role: 'ESS' }));

        await login.navigate();
        await admin.open();

    });

    test.afterEach(async ({ adminApi }) => {

        if (createdUser) {
            await adminApi.deleteUserByUsername(createdUser.username);
            createdUser = undefined;
        }

    });

    test('TC107: Edit existing user', async ({ admin }) => {

        await admin.editUserStatus(createdUser!.username, 'Disabled');

        await admin.searchByAllFilters({
            username: createdUser!.username,
            userRole: createdUser!.role,
            employeeName: createdUser!.employeeName
        });

        await admin.assertUserStatus(createdUser!.username, 'Disabled');

    });     

});