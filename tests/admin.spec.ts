import { test, expect } from './support';
import { buildUserData } from './support/data/userController';

test.describe(('Admin - System Users'), ()=>{

        let createdUsername: string | undefined;

        test.beforeEach(async ({ login, admin }) => {
            await login.navigate();
            await admin.open();
        });

        test.afterEach(async ({ admin }) => {

        if (createdUsername) {
            await admin.deleteUserByUsername(createdUsername);
            createdUsername = undefined;
        }

    });

        test('TC-01: View user list', async ({admin }) => {

            await admin.searchMenuItem('Admin');

            await expect(await admin.getUserRows()).not.toHaveCount(0);

            await admin.getRecordCount(await (await admin.getUserRows()).count());

        });

        test('TC-02: Adicionar novo usuário com dados válidos', async ({admin }) => {

            const userData = buildUserData();
            createdUsername = await admin.createUser(userData);

            await admin.searchByUsername(createdUsername);

            await admin.assertUserExists(createdUsername);

        });

})

