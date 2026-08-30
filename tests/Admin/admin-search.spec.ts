import { test, expect } from '../support';
import { ApiCreatedUser } from '../support/api/adminApi';
import { buildUserData } from '../support/data/admin/userController';

test.describe('Admin - Search Users', { tag: '@admin' }, () => {

        let createdUser: ApiCreatedUser | undefined;

        test.beforeEach(async ({ login, admin, adminApi }) => {

            createdUser = await adminApi.createUser(buildUserData());

            await login.navigate();
            await admin.open();

        });

        test.afterEach(async ({ adminApi  }) => {

            if (createdUser) {
                await adminApi.deleteUserByUsername(createdUser.username);
                createdUser = undefined;
            }

        });

        test('TC101: Should display the system users list', async ({ admin }) => {

            await admin.searchByUsername(createdUser!.username);

            await expect(await admin.getUserRows()).toHaveCount(1);

            await admin.assertAllRowsHaveUserData(createdUser!.username);

            await admin.getRecordCount(await (await admin.getUserRows()).count());

        });

        test('TC102: Should search for a specific user using all filters', async ({ admin }) => {

            await admin.searchByAllFilters({
                username: createdUser!.username,
                userRole: createdUser!.role,
                employeeName: createdUser!.employeeName,
                status: createdUser!.status,
            });

            await admin.assertUserExists(createdUser!.username);
            await admin.assertUserExists(createdUser!.role);
            await admin.assertUserExists(createdUser!.employeeName);
            await admin.assertUserExists(createdUser!.status);

        });

        test('TC103: Filter users by User Role', async ({ admin }) => {

            await admin.searchByAllFilters({ userRole: createdUser!.role });

            await admin.assertAllRowsHaveUserData(createdUser!.role);

            await admin.getRecordCount(await (await admin.getUserRows()).count());

        });

})



