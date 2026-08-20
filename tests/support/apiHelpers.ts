import { APIRequestContext, APIResponse } from '@playwright/test';

type QueryParams = Record<string, string | number | boolean>;

export class ApiHelper {

    constructor(
        protected readonly request: APIRequestContext
    ) {
        this.request = request;
    }

    protected async get<T = unknown>(url: string, params?: QueryParams): Promise<T> {
        const response = await this.request.get(url, { params });
        return this.parseResponse<T>(response, 'GET', url);
    }

    protected async post<T = unknown>(url: string, data?: unknown): Promise<T> {
        const response = await this.request.post(url, { data });
        return this.parseResponse<T>(response, 'POST', url);
    }

    protected async delete<T = unknown>(url: string, data?: unknown): Promise<T> {
        const response = await this.request.delete(url, { data });
        return this.parseResponse<T>(response, 'DELETE', url);
    }

    private async parseResponse<T>(response: APIResponse, method: string, url: string): Promise<T> {

        if (!response.ok()) {
            const errorBody = await response.text().catch(() => '');
            throw new Error(
                `[${method}] ${url} falhou com status ${response.status()}. Resposta: ${errorBody.slice(0, 300)}`
            );
        }

        return response.json() as Promise<T>;

    }

}