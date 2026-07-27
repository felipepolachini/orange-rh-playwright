import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {

    readonly page: Page;

    readonly txtUsername: Locator;
    readonly txtPassword: Locator;
    readonly btnLogin: Locator;
    readonly imgLogo: Locator;
    readonly lblForgotPassword: Locator;

    constructor(page: Page) {

        this.page = page;

        this.txtUsername = page.getByPlaceholder('Username');
        this.txtPassword = page.getByPlaceholder('Password');
        this.btnLogin = page.getByRole('button', {
            name: 'Login'
        });

        this.imgLogo = page.locator('.orangehrm-login-branding img');

        this.lblForgotPassword = page.getByText(
            'Forgot your password?'
        );
    }

    async navigate(): Promise<void> {

        await this.page.goto('/');

    }

    async waitUntilLoaded(): Promise<void> {

        await expect(this.txtUsername).toBeVisible();

        await expect(this.txtPassword).toBeVisible();

        await expect(this.btnLogin).toBeVisible();

    }

    async fillUsername(username: string): Promise<void> {

        await this.txtUsername.fill(username);

    }

    async fillPassword(password: string): Promise<void> {

        await this.txtPassword.fill(password);

    }

    async clickLogin(): Promise<void> {

        await this.btnLogin.click();

    }

    async login(username: string, password: string): Promise<void> {

        await this.fillUsername(username);

        await this.fillPassword(password);

        await this.clickLogin();

    }

    async validateLoginPage(): Promise<void> {

        await expect(this.page).toHaveURL(/auth\/login/);

        await expect(this.imgLogo).toBeVisible();

        await expect(this.lblForgotPassword).toBeVisible();

    }

}