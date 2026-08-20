import { ApiHelper } from '../apiHelpers';
import { ApiRoutes } from '../apiController';
import { APIRequestContext } from '@playwright/test';
import type { EmployeeData } from '../data/pim/employeeController';

export interface PimEmployee {
    empNumber: number;
    fullName: string;
}

export interface ApiCreatedEmployee {
    empNumber: number;
    employeeId: string;
    fullName: string;
}

interface PimEmployeesResponse {
    data: Array<{
        empNumber: number;
        firstName: string;
        lastName: string;
        employeeId: string | null;
    }>;
}

/**
 * ATENÇÃO: schema de resposta assumido — não confirmado contra uma
 * chamada real de POST /pim/employees. Se retornar 400/422, confira no
 * DevTools o payload exato que a UI envia ao criar um funcionário.
 */
interface CreateEmployeeResponse {
    data: {
        empNumber: number;
        employeeId: string;
        firstName: string;
        lastName: string;
    };
}

export class PimApi extends ApiHelper {

    constructor(
        request: APIRequestContext,
    ) {
        super(request);
    }

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

    /**
     * ATENÇÃO: assume que "nameOrId" também casa com employeeId (o nome
     * do parâmetro sugere isso, mas não foi testado especificamente com
     * um employeeId como termo de busca).
     */
    async findEmployeeByEmployeeId(employeeId: string): Promise<{ empNumber: number }> {

        const body = await this.get<PimEmployeesResponse>(ApiRoutes.pimEmployees, {
            nameOrId: employeeId,
        });

        const employee = body.data?.find(e => e.employeeId === employeeId);

        if (!employee) {
            throw new Error(`Funcionário com employeeId "${employeeId}" não encontrado via API.`);
        }

        return { empNumber: employee.empNumber };
    }

    /**
     * ATENÇÃO: payload assumido (firstName, lastName, employeeId) — não
     * confirmado contra uma chamada real. Confirme no DevTools antes de
     * confiar em CI (mesmo processo que usamos pra confirmar o payload de
     * criação de usuário no Admin).
     */
    async createEmployee(data: EmployeeData): Promise<ApiCreatedEmployee> {

        const body = await this.post<CreateEmployeeResponse>(ApiRoutes.pimEmployees, {
            firstName: data.firstName,
            lastName: data.lastName
        });

        const created = body.data;

        return {
            empNumber: created.empNumber,
            employeeId: created.employeeId,
            fullName: [created.firstName, created.lastName].filter(Boolean).join(' '),
        };
    }

    /**
     * ATENÇÃO: assume o mesmo formato de exclusão do admin/users
     * ({ ids: [empNumber] }) — não confirmado para este endpoint
     * especificamente.
     */
    async deleteEmployeeByEmployeeId(employeeId: string): Promise<void> {

        const { empNumber } = await this.findEmployeeByEmployeeId(employeeId);

        await this.delete(ApiRoutes.pimEmployees, { ids: [empNumber] });

    }

}