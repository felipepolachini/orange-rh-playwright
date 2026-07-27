import { expect, test as base, FullConfig } from '@playwright/test';
import { AdminPage } from './actions/admin';
import { LoginPage } from './actions/login';


type Fixtures = {
  login: LoginPage;
  admin: AdminPage;
};

export const test = base.extend<Fixtures>({
  login: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  admin: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
});

export { expect };