import { test } from '../support';
import { buildUserData } from '../support/data/admin/userController';

test.describe('Admin - Create System User', () => {

    let createdUsername: string | undefined;

    test.beforeEach(async ({ login, admin }) => {
        await login.navigate();
        await admin.open();
    });

    test.afterEach(async ({ adminApi }) => {
        if (createdUsername) {
            await adminApi.deleteUserByUsername(createdUsername);
            createdUsername = undefined;
        }
    });

    test('TC-03: Should add a new user with valid data', async ({ admin }) => {

        const userData = buildUserData();

        createdUsername = await admin.createUser(userData);

        await admin.searchByUsername(createdUsername);

        await admin.assertUserExists(createdUsername);
    });

});

test.describe('Admin - Add User Form Validation', () => {

    test.beforeEach(async ({ login, admin }) => {
        await login.navigate();
        await admin.open();
    });

    test('TC-04: Should display required field validation for mandatory fields', async ({ admin }) => {

        await admin.submitEmptyAddUserForm();

        await admin.assertFieldRequired('Employee Name');
        await admin.assertFieldRequired('User Role');
        await admin.assertFieldRequired('Status');
        await admin.assertFieldRequired('Username');

        await admin.assertAddUserFormStillOpen();
    });

});