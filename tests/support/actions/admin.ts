import { expect, Locator, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

export interface UserData {
    employeeName: string;
    role: 'Admin' | 'ESS';
    status: 'Enabled' | 'Disabled';
    username?: string;
    password?: string;
}

export class AdminPage {

    constructor(private readonly page: Page) {}

    // ==========================
    // Locators
    // ==========================

    private get menuAdmin() {
        return this.page.getByRole('link', { name: 'Admin' });
    }

    private get heading() {
        return this.page.getByRole('heading', { name: 'Admin' });
    }

    private get usernameField() {
        return this.page.getByRole('textbox').first();
    }

    private get searchButton() {
        return this.page.getByRole('button', { name: 'Search' });
    }

    private get resetButton() {
        return this.page.getByRole('button', { name: 'Reset' });
    }

    private get addButton() {
        return this.page.getByRole('button', { name: 'Add' });
    }

    private get saveButton() {
        return this.page.getByRole('button', { name: 'Save' });
    }

    // ==========================
    // Navigation
    // ==========================

    async open(): Promise<void> {

        await this.menuAdmin.click();

        await expect(this.heading).toBeVisible();

    }

    // ==========================
    // Search
    // ==========================

    async searchUser(username: string): Promise<void> {

        await this.usernameField.clear();

        await this.usernameField.fill(username);

        await this.searchButton.click();

        await expect(
            this.page.locator('.oxd-table')
        ).toBeVisible();

    }

    async clearSearch(): Promise<void> {

        await this.resetButton.click();

    }

    // ==========================
    // Create User
    // ==========================

    async createUser(data: UserData): Promise<string> {

        const username =
            data.username ??
            faker.internet.username().toLowerCase();

        const password =
            data.password ??
            faker.internet.password({
                length: 12,
                memorable: false
            });

        await this.addButton.click();

        await expect(
            this.page.getByRole('heading', {
                name: 'Add User'
            })
        ).toBeVisible();

        // User Role
        await this.page
            .locator('.oxd-select-text')
            .first()
            .click();

        await this.page
            .getByRole('option', {
                name: data.role
            })
            .click();

        // Employee
        const employee = this.page.getByPlaceholder('Type for hints...');

        await employee.fill(data.employeeName);

        await employee.press('ArrowDown');

        await employee.press('Enter');

        // Status
        await this.page
            .locator('.oxd-select-text')
            .nth(1)
            .click();

        await this.page
            .getByRole('option', {
                name: data.status
            })
            .click();

        // Username
        await this.page
            .locator("input.oxd-input")
            .nth(1)
            .fill(username);

        // Password
        await this.page
            .locator('input[type=password]')
            .first()
            .fill(password);

        await this.page
            .locator('input[type=password]')
            .nth(1)
            .fill(password);

        await this.saveButton.click();

        await expect(
            this.page.getByText('Successfully Saved')
        ).toBeVisible();

        return username;

    }

    // ==========================
    // Edit
    // ==========================

    async editFirstUser(): Promise<void> {

        await this.page
            .locator('button')
            .filter({ has: this.page.locator('.bi-pencil-fill') })
            .first()
            .click();

    }

    // ==========================
    // Delete
    // ==========================

    async deleteFirstUser(): Promise<void> {

        await this.page
            .locator('button')
            .filter({ has: this.page.locator('.bi-trash') })
            .first()
            .click();

        await this.page
            .getByRole('button', {
                name: 'Yes, Delete'
            })
            .click();

        await expect(
            this.page.getByText('Successfully Deleted')
        ).toBeVisible();

    }

    // ==========================
    // Assertions
    // ==========================

    async expectUserExists(username: string): Promise<void> {

       await expect(this.heading).toBeVisible();

    }

}