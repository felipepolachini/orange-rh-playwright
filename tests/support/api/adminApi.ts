import { APIRequestContext } from '@playwright/test';
import { ApiRoutes } from '../apiController';

interface SystemUser {
    id: number;
    userName: string;
}

export class AdminApi {

    constructor(private readonly request: APIRequestContext) {}

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
}