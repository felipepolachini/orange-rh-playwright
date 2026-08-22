import { test, expect } from '../support';
import { buildEmployeeData } from '../support/data/pim/employeeController';
import type { ApiCreatedEmployee } from '../support/api/pimAPI';

test.describe('PIM - Delete Employee Information', () => {

    let createdEmployee: ApiCreatedEmployee | undefined;

    test.beforeEach(async ({ login, pim, pimApi }) => {

        createdEmployee = await pimApi.createEmployee(buildEmployeeData());

        await login.navigate();
        await pim.open();

    });

    test.afterEach(async ({ pimApi }) => {

        if (createdEmployee) {
            await pimApi.deleteEmployeeByEmpNumber(createdEmployee.empNumber).catch(() => {});
            createdEmployee = undefined;
        }

    });

    test('TC205: Deletar funcionário', async ({ pim }) => {

        await pim.deleteEmployee(createdEmployee!.fullName);

        await pim.searchByEmployeeName(createdEmployee!.fullName);

        await expect(await pim.getEmployeeRows()).toHaveCount(0);

        createdEmployee = undefined;

    });

});