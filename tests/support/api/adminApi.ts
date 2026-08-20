import { APIRequestContext } from '@playwright/test';
import { ApiHelper } from '../apiHelpers';
import { ApiRoutes } from '../apiController';
import type { UserData } from '../data/admin/userController';
import { PimApi } from './pimAPI';
import { faker } from '@faker-js/faker';

interface SystemUser {
    id: number;
    userName: string;
}

interface SystemUsersResponse {
    data: SystemUser[];
}

interface CreateUserResponse {
    data: {
        userName: string;
        employee?: {
            firstName: string;
            lastName: string;
        };
    };
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

export class AdminApi extends ApiHelper {

    constructor(
        request: APIRequestContext,
        private readonly pimApi: PimApi
    ) {
        super(request);
        this.pimApi = pimApi;
    }

    async findUserIdByUsername(username: string): Promise<number> {

        const body = await this.get<SystemUsersResponse>(ApiRoutes.adminUsers, {
            username,
            limit: 50,
            offset: 0,
        });

        const user = body.data.find(u => u.userName === username);

        if (!user) {
            throw new Error(`Usuário "${username}" não encontrado via API.`);
        }

        return user.id;
    }

    async deleteUserByUsername(username: string): Promise<void> {

        const id = await this.findUserIdByUsername(username);

        await this.delete(ApiRoutes.adminUsers, { ids: [id] });

    }

    async createUser(data: UserData): Promise<ApiCreatedUser> {

        const searchTerm = faker.helpers.arrayElement(['a', 'e', 'i', 'o', 'u']);

        const employee = await this.pimApi.findExistingEmployee(searchTerm);

        const body = await this.post<CreateUserResponse>(ApiRoutes.adminUsers, {
            username: data.username,
            password: data.password,
            status: data.status === 'Enabled',
            userRoleId: USER_ROLE_IDS[data.role],
            empNumber: employee.empNumber,
        });

        const created = body.data;

        return {
            username: created.userName,
            employeeName: [created.employee?.firstName, created.employee?.lastName].filter(Boolean).join(' '),
            role: data.role,
            status: data.status,
        };
    }
}