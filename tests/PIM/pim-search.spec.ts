import { test, expect } from '../support';
import { buildEmployeeData } from '../support/data/pim/employeeController';
import type { ApiCreatedEmployee } from '../support/api/pimAPI';
import { faker } from '@faker-js/faker';

test.describe('PIM - Search Employee Information', () => {

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

    test('TC201: Search employee using name filter', async ({ pim }) => {

        await pim.searchByAllFilters({
            employeeName: createdEmployee!.fullName,
        });

        await expect(await pim.getEmployeeRows()).not.toHaveCount(0);

        await pim.assertEmployeeExists(createdEmployee!.fullName);

    });

});

test.describe('Filters without dedicated test data', () => {

        test.beforeEach(async ({ login, pim }) => {
            await login.navigate();
            await pim.open();
        });

        test('TC202: Filter employees by Employment Status', async ({ pim }) => {

            await pim.searchByAllFilters({ employmentStatus: 'Full-Time Permanent' });

            await pim.assertAllRowsHaveEmploymentStatus('Full-Time Permanent');

        });

        test('TC203: Search for a non-existent employee', async ({ pim }) => {

            await pim.searchByEmployeeId(faker.string.alphanumeric(4));

            await pim.assertNoRecordsFound();

        });

    });
