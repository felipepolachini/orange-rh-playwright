import { test, expect } from '../support';
import { buildEmployeeData } from '../support/data/pim/employeeController';
import type { ApiCreatedEmployee } from '../support/api/pimAPI';

test.describe('PIM - Employee Information', () => {

    let createdEmployee: ApiCreatedEmployee | undefined;

    test.beforeEach(async ({ login, pim, pimApi }) => {

        createdEmployee = await pimApi.createEmployee(buildEmployeeData());

        await login.navigate();
        await pim.open();

    });

    test.afterEach(async ({ pimApi }) => {

        if (createdEmployee) {
            await pimApi.deleteEmployeeByEmployeeId(createdEmployee.employeeId).catch(() => {});
            createdEmployee = undefined;
        }

    });

    test('TC205: Deletar funcionário', async ({ pim }) => {

        await pim.deleteEmployeeByEmployeeId(createdEmployee!.employeeId);

        await pim.searchByEmployeeId(createdEmployee!.employeeId);

        await expect(await pim.getEmployeeRows()).toHaveCount(0);

        createdEmployee = undefined;

    });

});