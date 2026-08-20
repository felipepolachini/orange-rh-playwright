import { test, expect } from '../support';
import { ApiCreatedUser } from '../support/api/adminApi';
import { buildUserData } from '../support/data/admin/userController';

test.describe(('Admin - Search Users'), ()=>{

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

        test('TC-01: Should display the system users list', async ({admin }) => {

            await admin.searchMenuItem('Admin');

            await expect(await admin.getUserRows()).not.toHaveCount(0);

            await admin.getRecordCount(await (await admin.getUserRows()).count());

        });

        test('TC-02: Should search for a specific user using all filters', async ({ admin }) => {

            await admin.searchByAllFilters({
                username: createdUser!.username,
                userRole: createdUser!.role,
                employeeName: createdUser!.employeeName,
                status: createdUser!.status,
            });

            await admin.assertUserExists(createdUser!.username);

        });


})

