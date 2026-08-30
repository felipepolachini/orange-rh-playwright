import { test, expect } from '../support';
import { buildEmployeeData } from '../support/data/pim/employeeController';

test.describe('PIM - Add Employee Information', { tag: '@pim'}, () => {

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

    test('TC204: Add new employee with valid data', async ({ pim }) => {

        const employeeData = buildEmployeeData();

        createdEmployeeId = await pim.createEmployee(employeeData);

        await pim.openEmployeeList();
        await pim.searchByEmployeeId(createdEmployeeId);

        await pim.assertEmployeeExists(createdEmployeeId);

    });

});

test.describe('PIM - Add Employee Form Validation', { tag: '@pim'}, () => {

    test.beforeEach(async ({ login, pim }) => {
        await login.navigate();
        await pim.open();
    });


    test('TC205: First Name and Last Name fields are required', async ({ pim }) => {

        await pim.submitEmptyAddEmployeeForm();

        await pim.assertFieldRequired('First Name');
        await pim.assertFieldRequired('Last Name');

        await pim.assertAddEmployeeFormStillOpen();

    });

})