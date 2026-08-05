import { test } from '../support';
import { buildUserData } from '../support/data/admin/userController';

test.describe(('Admin - System Users'), ()=>{

        let createdUsername: string | undefined;

        test.beforeEach(async ({ login, admin }) => {
            await login.navigate();
            await admin.open();

            
        });

        test.afterEach(async ({ adminApi  }) => {

            if (createdUsername) {
                await adminApi.deleteUserByUsername(createdUsername);
                createdUsername = undefined;
            }

        });

        test('TC-02: Adicionar novo usuário com dados válidos', async ({admin }) => {

            const userData = buildUserData();
            createdUsername = await admin.createUser(userData);

            await admin.searchByUsername(createdUsername);

            await admin.assertUserExists(createdUsername);

        });

         

})

