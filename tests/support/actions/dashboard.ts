import { expect, Locator, Page } from '@playwright/test';

export class DashboardPage {

    readonly page: Page;

    readonly lblDashboard: Locator;

    constructor(page: Page) {

        this.page = page;

        this.lblDashboard = page.getByRole('heading', { name: 'Dashboard' })

    }

    async waitUntilLoaded(): Promise<void> {

        await expect(this.page).toHaveURL(/dashboard/);

        await expect(this.lblDashboard).toBeVisible();

    }

}