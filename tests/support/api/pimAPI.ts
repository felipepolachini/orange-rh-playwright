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
    employeeId: string | null;
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
 * CONFIRMADO (via bug real): o campo "employeeId" não é definido na
 * criação via POST /pim/employees com apenas firstName/lastName — a
 * resposta retorna employeeId: null. Não sabemos ainda COMO o employeeId
 * é atribuído (talvez exija outro campo no payload, ou um PUT separado em
 * /personal-details) — confirme no DevTools se precisar de um employeeId
 * não-nulo logo após a criação via API.
 */
interface CreateEmployeeResponse {
    data: {
        empNumber: number;
        employeeId: string | null;
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
     * Busca por nome — mais confiável que buscar por employeeId, já que
     * este pode ser null para funcionários recém-criados via API.
     */
    async findEmployeeByFullName(fullName: string): Promise<{ empNumber: number }> {

        const body = await this.get<PimEmployeesResponse>(ApiRoutes.pimEmployees, {
            nameOrId: fullName,
        });

        const employee = body.data?.find(e =>
            [e.firstName, e.lastName].filter(Boolean).join(' ') === fullName
        );

        if (!employee) {
            throw new Error(`Funcionário com nome "${fullName}" não encontrado via API.`);
        }

        return { empNumber: employee.empNumber };
    }

    /**
     * ATENÇÃO: só funciona se o funcionário tiver um employeeId não-nulo.
     * Para funcionários criados via createEmployee() (API), o employeeId
     * vem null — use findEmployeeByFullName() ou o empNumber retornado
     * por createEmployee() nesse caso.
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
     * ATENÇÃO: payload confirmado como aceito pela API (firstName,
     * lastName) — mas o employeeId retornado na resposta vem null, não o
     * valor de EmployeeData.employeeId (que hoje não é enviado).
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
     * Forma recomendada de deletar: usa empNumber diretamente (você já
     * tem esse valor a partir do retorno de createEmployee() ou
     * findExistingEmployee()), sem depender de employeeId.
     */
    async deleteEmployeeByEmpNumber(empNumber: number): Promise<void> {
        await this.delete(ApiRoutes.pimEmployees, { ids: [empNumber] });
    }

    /**
     * ATENÇÃO: só funciona se o funcionário tiver um employeeId não-nulo
     * (ex: criado via UI, onde o campo é preenchido de verdade). Prefira
     * deleteEmployeeByEmpNumber() quando já tiver o empNumber em mãos.
     */
    async deleteEmployeeByEmployeeId(employeeId: string): Promise<void> {

        const { empNumber } = await this.findEmployeeByEmployeeId(employeeId);

        await this.deleteEmployeeByEmpNumber(empNumber);

    }

}