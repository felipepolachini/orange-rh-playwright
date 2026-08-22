import { expect, Locator, Page } from '@playwright/test';
import type { EmployeeData } from '../data/pim/employeeController';

export interface EmployeeSearchFilters {
    employeeName?: string;
    employeeId?: string;
    employmentStatus?: string;
}

export class PimPage {

    constructor(private readonly page: Page) {
        this.page = page;
    }

    // ==========================
    // Locators — helpers de container por label
    // ==========================

    /**
     * ATENÇÃO: existem dois helpers de container parecidos aqui
     * (formFieldContainerFocus e formFieldContainer), usando estratégias
     * diferentes (filter por label vs. getByPlaceholder). Nenhum dos dois
     * foi confirmado contra o DOM real da tela de Employee. Recomendo
     * rodar `npx playwright codegen` nessa tela e unificar num só, depois
     * de confirmar qual funciona.
     */
    private formFieldContainerFocus(label: string | RegExp): Locator {
        return this.page
            .locator('.oxd-input-group')
            .filter({ hasText: label });
    }

    private formFieldContainer(label: string | RegExp): Locator {
        return this.page
            .locator('.oxd-input-group')
            .getByPlaceholder(label);
    }

    private filterFieldContainer(label: string | RegExp): Locator {
        return this.page
            .locator('.oxd-grid-item')
            .filter({ hasText: label });
    }

    private filterDropdown(label: string | RegExp): Locator {
        return this.filterFieldContainer(label).locator('.oxd-select-text');
    }

    // ==========================
    // Locators — navegação e ações gerais
    // ==========================

    private get menuPim() {
        return this.page.getByRole('link', { name: 'PIM' });
    }

    private get heading() {
        return this.page.getByRole('heading', { name: 'PIM' });
    }

    private get menuEmployeeList() {
        return this.page.getByRole('link', { name: 'Employee List' });
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

    private get employeeRows() {
        return this.page.locator('.oxd-table-body').getByRole('row');
    }

    /**
     * Linha da tabela filtrada por qualquer texto (nome ou employeeId).
     * Usado como base para assertEmployeeExists e as ações que precisam
     * localizar uma linha específica — não depende de qual campo você
     * está usando como identificador.
     */
    private employeeRowByText(text: string): Locator {
        return this.employeeRows.filter({ hasText: text });
    }

    // ==========================
    // Locators — filtros de busca
    // ==========================

    private get employeeNameFilterField() {
        return this.filterFieldContainer('Employee Name')
            .getByRole('textbox', { name: 'Type for hints...' });
    }

    private get employeeIdFilterField() {
        return this.filterFieldContainer(/^Employee Id$/).getByRole('textbox');
    }

    private get employmentStatusFilterDropdown() {
        return this.filterDropdown('Employment Status');
    }

    // ==========================
    // Locators — formulário Add Employee / Personal Details
    // ==========================

    private get formFirstNameField() {
        return this.formFieldContainer('First Name');
    }

    private get formLastNameField() {
        return this.formFieldContainer('Last Name');
    }

    private get formEmployeeIdField() {
        return this.formFieldContainerFocus(/^Employee Id$/).getByRole('textbox')
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

    /**
     * ATENÇÃO: assume um ícone de lixeira (mesma classe do Admin) por
     * linha da lista de funcionários. Não confirmado — confira no
     * DevTools antes de rodar.
     */
    private rowActionIcon(row: Locator, iconClass: string): Locator {
        return row.getByRole('button').locator(iconClass);
    }

    private async confirmDeletion(): Promise<void> {

        const confirmDeleteButton = this.page.getByRole('button', { name: 'Yes, Delete' });

        await expect(confirmDeleteButton).toBeVisible();

        await confirmDeleteButton.click();

        await this.assertSuccessMessage('Successfully Deleted');

    }

    /**
     * ATENÇÃO: texto de sucesso assumido igual ao padrão do Admin — não
     * confirmado especificamente para o módulo PIM.
     */
    private async assertSuccessMessage(message: string): Promise<void> {
        await expect(this.page.getByText(message)).toBeVisible();
    }


    private fieldErrorByPlaceholder(placeholder: string, message: string): Locator {
        return this.page
            .getByPlaceholder(placeholder)
            .locator('../..')
            .getByText(message);
    }


    private async searchAndConfirmEmployeeExists(identifier: string): Promise<void> {
        await this.searchByAllFilters({ employeeName: identifier });
        await this.assertEmployeeExists(identifier);
    }

    // ==========================
    // Navigation
    // ==========================

    async open(): Promise<void> {

        await this.menuPim.click();

        await expect(this.heading).toBeVisible();

    }

    async openEmployeeList(): Promise<void> {

        await this.menuEmployeeList.click();
    }

    // ==========================
    // Search
    // ==========================

    async searchByEmployeeId(employeeId: string): Promise<void> {
        await this.searchByAllFilters({ employeeId });
    }

    async searchByEmployeeName(employeeName: string): Promise<void> {
        await this.searchByAllFilters({ employeeName });
    }

    async searchByAllFilters(filters: EmployeeSearchFilters): Promise<void> {

        if (filters.employeeName) {
            await this.selectFirstAutocompleteSuggestion(this.employeeNameFilterField, filters.employeeName);
        }

        if (filters.employeeId) {
            await this.employeeIdFilterField.clear();
            await this.employeeIdFilterField.fill(filters.employeeId);
        }

        if (filters.employmentStatus) {
            await this.selectDropdownOption(this.employmentStatusFilterDropdown, filters.employmentStatus);
        }

        await this.searchButton.click();

        await this.waitForTableToLoad();

    }

    async clearSearch(): Promise<void> {

        await this.resetButton.click();

    }

    // ==========================
    // Create Employee
    // ==========================

    private async openAddEmployeeForm(): Promise<void> {

        await this.addButton.click();

        await this.assertAddEmployeeFormStillOpen();

    }

    async createEmployee(data: EmployeeData): Promise<string> {

        await this.openAddEmployeeForm();

        await this.formFirstNameField.fill(data.firstName);

        await this.formLastNameField.fill(data.lastName);

        await this.formEmployeeIdField.fill(data.employeeId);

        await this.saveButton.click();

        await this.assertSuccessMessage('Successfully Saved');

        return data.employeeId;

    }

    // ==========================
    // Edit Employee
    // ==========================

    /**
     * Busca o funcionário pelo NOME (searchIdentifier) — funciona mesmo
     * que o employeeId atual seja null — e edita o Employee Id dele para
     * newEmployeeId.
     */
    async editEmployeeId(searchIdentifier: string, newEmployeeId: string): Promise<void> {

        await this.searchAndConfirmEmployeeExists(searchIdentifier);

        await this.employeeRowByText(searchIdentifier).click();

        await expect(
            this.page.getByRole('heading', { name: 'Personal Details' })
        ).toBeVisible();

        await this.formEmployeeIdField.fill('');

        await this.formEmployeeIdField.fill(newEmployeeId);

        await this.saveButton.click();

        await this.assertSuccessMessage('Successfully Updated');

    }

    // ==========================
    // Delete Employee
    // ==========================

    /**
     * Busca o funcionário pelo NOME e deleta — funciona mesmo com
     * employeeId null (funcionários criados via API).
     */
    async deleteEmployee(searchIdentifier: string): Promise<void> {

        await this.searchAndConfirmEmployeeExists(searchIdentifier);

        const row = this.employeeRowByText(searchIdentifier);

        await this.rowActionIcon(row, '.oxd-icon.bi-trash').click();

        await this.confirmDeletion();

    }

    // ==========================
    // Assertions
    // ==========================

    async getEmployeeRows() {
        return this.employeeRows;
    }

    async assertEmployeeExists(identifier: string): Promise<void> {
        await expect(this.employeeRowByText(identifier)).toHaveCount(1);
    }

    async submitEmptyAddEmployeeForm(): Promise<void> {

        await this.openAddEmployeeForm();

        await this.saveButton.click();

    }

    async assertFieldRequiredByPlaceholder(placeholder: string): Promise<void> {
        await expect(this.fieldErrorByPlaceholder(placeholder, 'Required')).toBeVisible();
    }

    async assertAddEmployeeFormStillOpen(): Promise<void> {
        await expect(
            this.page.getByRole('heading', { name: 'Add Employee' })
        ).toBeVisible();
    }

}