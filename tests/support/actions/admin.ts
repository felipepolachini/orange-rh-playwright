import { expect, Locator, Page } from '@playwright/test';
import type { UserData } from '../data/userController';


export class AdminPage {

    private readonly createdUsers: string[] = [];

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

    private get menuItemField() {
         return this.page
            .locator('.oxd-table-filter-area')
            .getByRole('textbox')
            .first();
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

    private get userRows() {
        return this.page.locator('.oxd-table-body').getByRole('row');
    }

    private userRowByUsername(username: string): Locator {
        return this.userRows.filter({ hasText: username });
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

    async searchMenuItem(menuItem: string): Promise<void> {

        await this.menuItemField.clear();

        await this.menuItemField.fill(menuItem);

        await this.searchButton.click();

        await expect(
            this.page.locator('.oxd-table')
        ).toBeVisible();

    }

    async searchByUsername(username: string): Promise<void> {
        await this.searchMenuItem(username);
    }

    async clearSearch(): Promise<void> {

        await this.resetButton.click();

    }

    // ==========================
    // Create User
    // ==========================

    async createUser(data: UserData): Promise<string> {

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
        const employee = this.page.getByRole('textbox', { name: 'Type for hints...' });

        await employee.fill(data.employeeName);

        const firstSuggestion = this.page
            .getByRole('option')
            .filter({ hasNotText: 'Searching' })
            .first();

        await expect(firstSuggestion).toBeVisible();

        await firstSuggestion.click();

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
            .fill(data.username);

        // Password
        await this.page
            .locator('input[type=password]')
            .first()
            .fill(data.password);

        await this.page
            .locator('input[type=password]')
            .nth(1)
            .fill(data.password);

        await this.saveButton.click();

        await expect(
            this.page.getByText('Successfully Saved')
        ).toBeVisible();

        this.createdUsers.push(data.username);

        return data.username;

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

    async deleteUserByUsername(username: string): Promise<void> {

        await this.searchByUsername(username);

        await this.deleteFirstUser();

    }

    async getUserRows() {
        return this.userRows;
    }


    async getRecordCount(number: number) {
        await this.page.getByText(`(${number}) Records Found`)
    }

    async assertUserExists(username: string): Promise<void> {
        await expect(this.userRowByUsername(username)).toHaveCount(1);
    }
}