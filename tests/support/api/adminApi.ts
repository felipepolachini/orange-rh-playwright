import { APIRequestContext } from '@playwright/test';
import { ApiRoutes } from '../apiController';
import type { UserData } from '../data/admin/userController';
import { PimApi } from './pimAPI';
import { faker } from '@faker-js/faker';

interface SystemUser {
    id: number;
    userName: string;
}

export interface ApiCreatedUser {
    username: string;
    employeeName: string;
    role: UserData['role'];
    status: UserData['status'];
}

const USER_ROLE_IDS: Record<UserData['role'], number> = {
    Admin: 1,
    ESS: 2,
};

export class AdminApi {

    constructor(
        private readonly request: APIRequestContext,
        private readonly pimApi: PimApi
    ) {
        this.request = request;
    }

    async findUserIdByUsername(username: string): Promise<number> {
        const response = await this.request.get(ApiRoutes.adminUsers, {
            params: {
                username,
                limit: 50,
                offset: 0,
            },
        });
        if (!response.ok()) {
            throw new Error(`Falha ao buscar usuário "${username}" via API: ${response.status()}`);
        }

        const body = await response.json();
        const users: SystemUser[] = body.data ?? [];
        const user = users.find(u => u.userName === username);
        if (!user) {
            throw new Error(`Usuário "${username}" não encontrado via API.`);
        }
        return user.id;
    }

    async deleteUserByUsername(username: string): Promise<void> {

        const id = await this.findUserIdByUsername(username);
        const response = await this.request.delete(ApiRoutes.adminUsers, {
            data: {
                ids: [id],
            },
        });
        if (!response.ok()) {
            throw new Error(`Falha ao deletar usuário "${username}" (id ${id}) via API: ${response.status()}`);
        }
    }

    async createUser(data: UserData): Promise<ApiCreatedUser> {

        const searchTerm = faker.helpers.arrayElement(['a', 'e', 'i', 'o', 'u']);

        const employee = await this.pimApi.findExistingEmployee(searchTerm);

        const response = await this.request.post(ApiRoutes.adminUsers, {
            data: {
                username: data.username,
                password: data.password,
                status: data.status === 'Enabled',
                userRoleId: USER_ROLE_IDS[data.role],
                empNumber: employee.empNumber,
            },
        });

        if (!response.ok()) {
            const errorBody = await response.text().catch(() => '');
            throw new Error(
                `Falha ao criar usuário "${data.username}" via API: ${response.status()}. Resposta: ${errorBody.slice(0, 300)}`
            );
        }

        const body = await response.json();
        const created = body.data;

        return {
            username: created.userName,
            employeeName: [created.employee?.firstName, created.employee?.lastName].filter(Boolean).join(' '),
            role: data.role,
            status: data.status,
        };
    }
}