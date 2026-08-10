import { expect, Locator, Page } from '@playwright/test';
import type { UserData } from '../data/admin/userController';

export interface UserSearchFilters {
    username?: string;
    userRole?: UserData['role'];
    employeeName?: string;
    status?: UserData['status'];
}

export interface CreatedUser {
    username: string;
    employeeName: string;
}

export class AdminPage {

    private readonly createdUsers: string[] = [];

    constructor(private readonly page: Page) {
        this.page = page;
    }

    // ==========================
    // Locators — helpers de container por label
    // ==========================

    /**
     * Container de campo dentro dos formulários Add/Edit User.
     * Reaproveitado por todos os campos do formulário (User Role, Status,
     * Username, Password, Confirm Password).
     */
    private formFieldContainer(label: string | RegExp): Locator {
        return this.page
            .locator('.oxd-input-group')
            .filter({ hasText: label });
    }

    /**
     * Container de campo dentro do formulário de busca (filtros).
     * Reaproveitado por usernameFilterField, userRoleFilterDropdown,
     * employeeNameFilterField e statusFilterDropdown.
     */
    private filterFieldContainer(label: string | RegExp): Locator {
        return this.page
            .locator('.oxd-grid-item')
            .filter({ hasText: label });
    }

    // ==========================
    // Locators — navegação e ações gerais
    // ==========================

    private get menuAdmin() {
        return this.page.getByRole('link', { name: 'Admin' });
    }

    private get heading() {
        return this.page.getByRole('heading', { name: 'Admin' });
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
    // Locators — filtros de busca
    // ==========================

    private get menuItemField() {
        return this.usernameFilterField;
    }

    private get usernameFilterField() {
        return this.filterFieldContainer(/^Username$/).getByRole('textbox');
    }

    private get userRoleFilterDropdown() {
        return this.filterFieldContainer(/^User Role/).locator('.oxd-select-text');
    }

    private get employeeNameFilterField() {
        return this.filterFieldContainer('Employee Name')
            .getByRole('textbox', { name: 'Type for hints...' });
    }

    private get statusFilterDropdown() {
        return this.filterFieldContainer('Status').locator('.oxd-select-text');
    }

    // ==========================
    // Locators — formulário Add/Edit User
    // ==========================

    private get formUserRoleDropdown() {
        return this.formFieldContainer('User Role').locator('.oxd-icon');
    }

    private get formStatusDropdown() {
        return this.formFieldContainer('Status').locator('.oxd-icon');
    }

    private get formUsernameField() {
        return this.formFieldContainer('Username').getByRole('textbox');
    }

    private get formPasswordField() {
        return this.formFieldContainer(/^Password$/).locator('input[type=password]');
    }

    private get formConfirmPasswordField() {
        return this.formFieldContainer(/^Confirm Password$/).locator('input[type=password]');
    }

    // ==========================
    // Ações genéricas reutilizáveis
    // ==========================

    private async selectDropdownOption(trigger: Locator, optionName: string): Promise<void> {
        await trigger.click();
        await this.page.getByRole('option', { name: optionName }).click();
    }

    private async selectFirstAutocompleteSuggestion(field: Locator, value: string): Promise<void> {

        await field.fill(value);

        const firstSuggestion = this.page
            .getByRole('option')
            .filter({ hasNotText: 'Searching' })
            .first();

        await expect(firstSuggestion).toBeVisible();

        await firstSuggestion.click();

    }

    private async waitForTableToLoad(): Promise<void> {
        await expect(this.page.locator('.oxd-table')).toBeVisible();
    }

    private async clickFirstRowActionIcon(iconClass: string): Promise<void> {
        await this.page.getByRole('button').locator(iconClass).first().click();
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

        await this.waitForTableToLoad();

    }

    async searchByUsername(username: string): Promise<void> {
        await this.searchMenuItem(username);
    }

    async searchByAllFilters(filters: UserSearchFilters): Promise<void> {

        if (filters.username) {
            await this.usernameFilterField.clear();
            await this.usernameFilterField.fill(filters.username);
        }

        if (filters.userRole) {
            await this.selectDropdownOption(this.userRoleFilterDropdown, filters.userRole);
        }

        if (filters.employeeName) {
            await this.selectFirstAutocompleteSuggestion(this.employeeNameFilterField, filters.employeeName);
        }

        if (filters.status) {
            await this.selectDropdownOption(this.statusFilterDropdown, filters.status);
        }

        await this.searchButton.click();

        await this.waitForTableToLoad();

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

        await this.selectDropdownOption(this.formUserRoleDropdown, data.role);

        const employee = this.page.getByRole('textbox', { name: 'Type for hints...' });

        await this.selectFirstAutocompleteSuggestion(employee, data.employeeName);

        await this.selectDropdownOption(this.formStatusDropdown, data.status);

        await this.formUsernameField.fill(data.username);

        await this.formPasswordField.fill(data.password);

        await this.formConfirmPasswordField.fill(data.password);

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
        await this.clickFirstRowActionIcon('.bi-pencil-fill');
    }

    async editUserStatus(username: string, newStatus: UserData['status']): Promise<void> {

        await this.searchByUsername(username);

        await this.assertUserExists(username);

        await this.editFirstUser();

        await expect(
            this.page.getByRole('heading', { name: 'Edit User' })
        ).toBeVisible();

        await this.selectDropdownOption(this.formStatusDropdown, newStatus);

        await this.saveButton.click();

        await expect(
            this.page.getByText('Successfully Updated')
        ).toBeVisible();

    }

    // ==========================
    // Delete
    // ==========================

    async deleteFirstUser(): Promise<void> {

        await this.clickFirstRowActionIcon('.bi-trash');

        const confirmDeleteButton = this.page.getByRole('button', { name: 'Yes, Delete' });

        await expect(confirmDeleteButton).toBeVisible();

        await confirmDeleteButton.click();

        await expect(
            this.page.getByText('Successfully Deleted')
        ).toBeVisible();

    }

    async deleteUserByUsername(username: string): Promise<void> {

        await this.searchByUsername(username);

        await this.assertUserExists(username);

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

    async assertUserStatus(username: string, status: UserData['status']): Promise<void> {
        await expect(this.userRowByUsername(username)).toContainText(status);
    }
}