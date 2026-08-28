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

    private formFieldContainer(label: string | RegExp): Locator {
        return this.page
            .locator('.oxd-input-group')
            .filter({ hasText: label });
    }

    private filterFieldContainer(label: string | RegExp): Locator {
        return this.page
            .locator('.oxd-grid-item')
            .filter({ hasText: label });
    }

    private formDropdown(label: string | RegExp): Locator {
        return this.formFieldContainer(label).locator('.oxd-icon');
    }

    private filterDropdown(label: string | RegExp): Locator {
        return this.filterFieldContainer(label).locator('.oxd-select-text--arrow');
    }

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

    private get menuItemField() {
        return this.usernameFilterField;
    }

    private get usernameFilterField() {
        return this.filterFieldContainer(/^Username$/).getByRole('textbox');
    }

    private get userRoleFilterDropdown() {
        return this.filterDropdown(/^User Role/);
    }

    private get employeeNameFilterField() {
        return this.filterFieldContainer('Employee Name')
            .getByRole('textbox', { name: 'Type for hints...' });
    }

    private get statusFilterDropdown() {
        return this.filterDropdown('Status');
    }

    private get formUserRoleDropdown() {
        return this.formDropdown('User Role');
    }

    private get formStatusDropdown() {
        return this.formDropdown('Status');
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

    private formFieldMessage(label: string | RegExp, message: string): Locator {
        return this.formFieldContainer(label).getByText(message);
    }

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
        await expect(this.page.locator('.orangehrm-container').getByRole('table')).toBeVisible();
    }

    private async clickFirstRowActionIcon(iconClass: string): Promise<void> {
        await this.page.getByRole('button').locator(iconClass).first().click();
    }

    private rowActionIcon(row: Locator, iconClass: string): Locator {
        return row.getByRole('button').locator(iconClass);
    }


    private async confirmDeletion(): Promise<void> {

        const confirmDeleteButton = this.page.getByRole('button', { name: 'Yes, Delete' });

        await expect(confirmDeleteButton).toBeVisible();

        await confirmDeleteButton.click();

        await this.assertSuccessMessage('Successfully Deleted');

    }

    private async assertFormHeadingVisible(formName: 'Add User' | 'Edit User'): Promise<void> {
        await expect(
            this.page.getByRole('heading', { name: formName })
        ).toBeVisible();
    }


    private async assertSuccessMessage(message: string): Promise<void> {
        await expect(this.page.getByText(message)).toBeVisible();
    }

    private async searchAndConfirmUserExists(username: string): Promise<void> {
        await this.searchByUsername(username);
        await this.assertUserExists(username);
    }

    private async openAddUserForm(): Promise<void> {

        await this.addButton.click();

        await this.assertAddUserFormStillOpen();

    }

    async open(): Promise<void> {

        await this.menuAdmin.click();

        await expect(this.heading).toBeVisible();

    }

    async searchMenuItem(menuItem: string): Promise<void> {
        await this.searchByAllFilters({ username: menuItem });
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

    async createUser(data: UserData): Promise<string> {

        await this.openAddUserForm();

        await this.selectDropdownOption(this.formUserRoleDropdown, data.role);

        const employee = this.page.getByRole('textbox', { name: 'Type for hints...' });

        await this.selectFirstAutocompleteSuggestion(employee, data.employeeName);

        await this.selectDropdownOption(this.formStatusDropdown, data.status);

        await this.formUsernameField.fill(data.username);

        await this.formPasswordField.fill(data.password);

        await this.formConfirmPasswordField.fill(data.password);

        await this.saveButton.click();

        await this.assertSuccessMessage('Successfully Saved');

        this.createdUsers.push(data.username);

        return data.username;

    }

    async editFirstUser(): Promise<void> {
        await this.clickFirstRowActionIcon('.oxd-icon.bi-pencil-fill');
    }

    async editUserStatus(username: string, newStatus: UserData['status']): Promise<void> {

        await this.searchAndConfirmUserExists(username);

        await this.editFirstUser();

        await this.assertFormHeadingVisible('Edit User');

        await this.selectDropdownOption(this.formStatusDropdown, newStatus);

        await this.saveButton.click();

        await this.assertSuccessMessage('Successfully Updated');

        await this.waitForTableToLoad();

    }

    async editUsername(currentUsername: string, newUsername: string): Promise<void> {

        await this.searchAndConfirmUserExists(currentUsername);

        await this.editFirstUser();

        await this.assertFormHeadingVisible('Edit User');

        await this.formUsernameField.clear();

        await this.formUsernameField.fill(newUsername);

        await this.saveButton.click();

    }

    async deleteFirstUser(): Promise<void> {

        await this.clickFirstRowActionIcon('.oxd-icon.bi-trash');

        await this.confirmDeletion();

    }

    async deleteUserByUsername(username: string): Promise<void> {

        await this.searchAndConfirmUserExists(username);

        const row = this.userRowByUsername(username);

        await this.rowActionIcon(row, '.oxd-icon.bi-trash').click();

        await this.confirmDeletion();

    }

    async getUserRows() {
        return this.userRows;
    }

    async getRecordCount(number: number): Promise<void> {
        await expect(this.page.getByText(new RegExp(`\\(${number}\\) Records? Found`))).toBeVisible();
    }

    async assertUserExists(username: string): Promise<void> {
        await expect(this.userRowByUsername(username)).toHaveCount(1);
    }

    async assertUserStatus(username: string, status: UserData['status']): Promise<void> {
        await expect(this.userRowByUsername(username)).toContainText(status);
    }

   async assertAllRowsHaveUserData<K extends keyof UserData>(value: UserData[K]): Promise<void> {
        await expect(this.userRows.first()).toBeVisible();

        const rowsWithoutValue = this.userRows.filter({
            hasNotText: String(value)
        });

        await expect(rowsWithoutValue).toHaveCount(0);
    }

    async submitEmptyAddUserForm(): Promise<void> {

        await this.openAddUserForm();

        await this.saveButton.click();

    }

    async assertFieldRequired(label: string | RegExp): Promise<void> {
        await expect(this.formFieldMessage(label, 'Required')).toBeVisible();
    }

    async assertFieldError(label: string | RegExp, message: string): Promise<void> {
        await expect(this.formFieldMessage(label, message)).toBeVisible();
    }

    async assertAddUserFormStillOpen(): Promise<void> {
        await this.assertFormHeadingVisible('Add User');
    }

    async assertEditUserFormStillOpen(): Promise<void> {
        await this.assertFormHeadingVisible('Edit User');
    }
}