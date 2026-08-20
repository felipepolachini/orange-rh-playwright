import { test, expect } from '../support';
import { buildEmployeeData } from '../support/data/pim/employeeController';

test.describe('PIM - Employee Information', () => {

    let createdEmployeeId: string | undefined;

    test.beforeEach(async ({ login, pim }) => {
        await login.navigate();
        await pim.open();
    });

    test.afterEach(async ({ pimApi }) => {

        if (createdEmployeeId) {
            await pimApi.deleteEmployeeByEmployeeId(createdEmployeeId);
            createdEmployeeId = undefined;
        }

    });

    test('TC203: Adicionar novo funcionário com dados válidos', async ({ pim }) => {

        const employeeData = buildEmployeeData();

        createdEmployeeId = await pim.createEmployee(employeeData);

        await pim.openEmployeeList();
        await pim.searchByEmployeeId(createdEmployeeId);

        await pim.assertEmployeeExists(createdEmployeeId);

    });

});