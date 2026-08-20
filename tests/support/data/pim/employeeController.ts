import { faker } from '@faker-js/faker';

const TEST_DATA_PREFIX = 'QA';

export interface EmployeeData {
    firstName: string;
    lastName: string;
    employeeId: string;
}

export function buildEmployeeData(overrides: Partial<EmployeeData> = {}): EmployeeData {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        employeeId: `${TEST_DATA_PREFIX}${faker.string.numeric(6)}`,
        ...overrides,
    };
}