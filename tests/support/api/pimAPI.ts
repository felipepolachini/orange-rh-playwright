import { APIRequestContext } from '@playwright/test';
import { ApiRoutes } from '../apiController';

export interface PimEmployee {
    empNumber: number;
    fullName: string;
}

export class PimApi {

    constructor(private readonly request: APIRequestContext) {
        this.request = request;
    }

    async findExistingEmployee(searchTerm: string = 'a'): Promise<PimEmployee> {

        const response = await this.request.get(ApiRoutes.pimEmployees, {
            params: { nameOrId: searchTerm },
        });

        if (!response.ok()) {
            throw new Error(`Falha ao buscar funcionário existente via API: ${response.status()}`);
        }

        const body = await response.json();
        const employee = body.data?.[0];

        if (!employee) {
            throw new Error(`Nenhum funcionário encontrado via API para o termo "${searchTerm}".`);
        }

        const fullName = [employee.firstName, employee.lastName].filter(Boolean).join(' ');

        return { empNumber: employee.empNumber, fullName };
    }
}