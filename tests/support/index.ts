import { expect, test as base } from '@playwright/test';
import { AdminPage } from './actions/admin';
import { LoginPage } from './actions/login';
import { DashboardPage } from './actions/dashboard';


type Fixtures = {
  login: LoginPage;
  admin: AdminPage;
  dashboard: DashboardPage;
};

export const test = base.extend<Fixtures>({
  login: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  admin: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
  dashboard: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect };