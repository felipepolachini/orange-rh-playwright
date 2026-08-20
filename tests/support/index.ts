import { test as base, expect, request as playwrightRequest } from '@playwright/test';
import { AdminPage } from './actions/admin';
import { LoginPage } from './actions/login';
import { DashboardPage } from './actions/dashboard';
import { PimPage } from './actions/pim';
import { AdminApi } from './api/adminApi';
import { PimApi } from './api/pimAPI';


type Fixtures = {
  login: LoginPage;
  admin: AdminPage;
  pim: PimPage;
  dashboard: DashboardPage;
  adminApi: AdminApi;
  pimApi: PimApi;
};

export const test = base.extend<Fixtures>({
  login: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  admin: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
  pim: async ({ page }, use) => {
    await use(new PimPage(page));
  },
  dashboard: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  pimApi: async ({ request }, use) => {

    const currentState = await request.storageState();

    const apiContext = await playwrightRequest.newContext({
      baseURL: process.env.BASE_URL,
      storageState: currentState,
    });

    await use(new PimApi(apiContext));

    await apiContext.dispose();

  },

  adminApi: async ({ request }, use) => {

    const currentState = await request.storageState();

    const apiContext = await playwrightRequest.newContext({
      baseURL: process.env.BASE_URL,
      storageState: currentState,
    });

    await use(new AdminApi(apiContext, new PimApi(apiContext)));

    await apiContext.dispose();

  },
});

export { expect };