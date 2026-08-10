import { ApiHelper } from '../apiHelpers';
import { ApiRoutes } from '../apiController';

export interface PimEmployee {
    empNumber: number;
    fullName: string;
}

interface PimEmployeesResponse {
    data: Array<{
        empNumber: number;
        firstName: string;
        lastName: string;
    }>;
}

export class PimApi extends ApiHelper {

    async findExistingEmployee(searchTerm: string = 'a'): Promise<PimEmployee> {

        const body = await this.get<PimEmployeesResponse>(ApiRoutes.pimEmployees, {
            nameOrId: searchTerm,
        });

        const employee = body.data?.[0];

        if (!employee) {
            throw new Error(`Nenhum funcionário encontrado via API para o termo "${searchTerm}".`);
        }

        const fullName = [employee.firstName, employee.lastName].filter(Boolean).join(' ');

        return { empNumber: employee.empNumber, fullName };
    }
}