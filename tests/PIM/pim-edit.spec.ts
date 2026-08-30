import { test, expect } from '../support';
import { buildEmployeeData } from '../support/data/pim/employeeController';
import type { ApiCreatedEmployee } from '../support/api/pimAPI';

test.describe('PIM - Edit Employee Information', { tag: '@pim'}, () => {

    let createdEmployee: ApiCreatedEmployee | undefined;

    test.beforeEach(async ({ login, pim, pimApi }) => {

        createdEmployee = await pimApi.createEmployee(buildEmployeeData());

        await login.navigate();
        await pim.open();

    });

    test.afterEach(async ({ pimApi }) => {

        if (createdEmployee) {
            await pimApi.deleteEmployeeByEmpNumber(createdEmployee.empNumber);
            createdEmployee = undefined;
        }

    });

    test('TC206: Edit existing employee', async ({ pim }) => {

        const newEmployeeId = `QA${Date.now()}`;

        await pim.editEmployeeId(createdEmployee!.fullName, newEmployeeId);

        await pim.openEmployeeList();
        await pim.searchByEmployeeName(createdEmployee!.fullName);
        await pim.assertEmployeeExists(createdEmployee!.fullName);
    });

});