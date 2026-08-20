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
            await pimApi.deleteEmployeeByEmployeeId(createdEmployee.employeeId);
            createdEmployee = undefined;
        }

    });

    test('TC201: Visualizar lista de funcionários', async ({ pim }) => {

        await pim.searchByEmployeeId(createdEmployee!.employeeId);

        await expect(await pim.getEmployeeRows()).not.toHaveCount(0);

    });

    test('TC202: Buscar funcionário usando todos os filtros', async ({ pim }) => {

        await pim.searchByAllFilters({
            employeeName: createdEmployee!.fullName,
            employeeId: createdEmployee!.employeeId,
        });

        await pim.assertEmployeeExists(createdEmployee!.employeeId);

    });

});