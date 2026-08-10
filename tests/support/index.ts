import { expect, request as playwrightRequest } from '@playwright/test';
import { test as base, pwApi } from 'pw-api-plugin';
import { AdminPage } from './actions/admin';
import { LoginPage } from './actions/login';
import { DashboardPage } from './actions/dashboard';
import { AdminApi } from './api/adminApi';
import { PimApi } from './api/pimAPI';


type Fixtures = {
  login: LoginPage;
  admin: AdminPage;
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
  dashboard: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  pimApi: async ({ request, page }, use) => {

    const currentState = await request.storageState();

    const apiContext = await playwrightRequest.newContext({
      baseURL: process.env.BASE_URL,
      storageState: currentState,
    });

    await use(new PimApi(apiContext, page));

    await apiContext.dispose();

  },

  adminApi: async ({ request, page }, use) => {

    const currentState = await request.storageState();

    const apiContext = await playwrightRequest.newContext({
      baseURL: process.env.BASE_URL,
      storageState: currentState,
    });

    await use(new AdminApi(apiContext, page, new PimApi(apiContext, page)));

    await apiContext.dispose();

  },
});

export { expect, pwApi };