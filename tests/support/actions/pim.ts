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
     * ATENÇÃO: assume a mesma estrutura de container (.oxd-grid-item para
     * filtros, .oxd-input-group para formulários) usada no módulo Admin,
     * já que ambos usam o mesmo framework de componentes (OXD). Não
     * confirmado especificamente contra a tela de Employee List — rode
     * `npx playwright codegen` nessa tela antes de confiar nisso.
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

    private employeeRowByEmployeeId(employeeId: string): Locator {
        return this.employeeRows.filter({ hasText: employeeId });
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
     * linha da lista de funcionários. Não confirmado — a tela de Employee
     * List pode ter uma estrutura de ações diferente (ex: checkbox +
     * botão de exclusão em massa no topo, em vez de ícone por linha).
     * Confirme no DevTools antes de rodar.
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
     * ATENÇÃO: texto de sucesso assumido igual ao padrão do Admin
     * ("Successfully Saved"/"Successfully Updated"/"Successfully
     * Deleted"). Não confirmado especificamente para o módulo PIM.
     */
    private async assertSuccessMessage(message: string): Promise<void> {
        await expect(this.page.getByText(message)).toBeVisible();
    }

    private async searchAndConfirmEmployeeExists(employeeId: string): Promise<void> {
        await this.searchByEmployeeId(employeeId);
        await this.assertEmployeeExists(employeeId);
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

    /**
     * ATENÇÃO: o fluxo de "Add Employee" no OrangeHRM normalmente é uma
     * navegação de página inteira (não um modal, como no Add User do
     * Admin), e o Employee Id costuma vir pré-preenchido automaticamente
     * pelo sistema — pode ser necessário limpar o campo antes de digitar
     * o valor desejado. Não confirmado contra a tela real.
     */
    async createEmployee(data: EmployeeData): Promise<string> {

        await this.addButton.click();

        await expect(
            this.page.getByRole('heading', { name: 'Add Employee' })
        ).toBeVisible();

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
     * ATENÇÃO: assume que clicar na linha do funcionário (ou num link com
     * o nome dele) navega para a aba "Personal Details", onde o Employee
     * Id pode ser editado. Não confirmado — pode ser necessário um
     * locator mais específico pro link do nome, em vez da linha inteira.
     */
    async editEmployeeId(currentEmployeeId: string, newEmployeeId: string): Promise<void> {

        await this.searchAndConfirmEmployeeExists(currentEmployeeId);

        await this.employeeRowByEmployeeId(currentEmployeeId).click();

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

    async deleteEmployeeByEmployeeId(employeeId: string): Promise<void> {

        await this.searchAndConfirmEmployeeExists(employeeId);

        const row = this.employeeRowByEmployeeId(employeeId);

        await this.rowActionIcon(row, '.oxd-icon.bi-trash').click();

        await this.confirmDeletion();

    }

    // ==========================
    // Assertions
    // ==========================

    async getEmployeeRows() {
        return this.employeeRows;
    }

    async assertEmployeeExists(employeeId: string): Promise<void> {
        await expect(this.employeeRowByEmployeeId(employeeId)).toHaveCount(1);
    }

}