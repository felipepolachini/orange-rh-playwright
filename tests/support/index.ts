import { expect, test as base, request as playwrightRequest} from '@playwright/test';
import { AdminPage } from './actions/admin';
import { LoginPage } from './actions/login';
import { DashboardPage } from './actions/dashboard';
import { AdminApi } from './api/adminApi';


type Fixtures = {
  login: LoginPage;
  admin: AdminPage;
  dashboard: DashboardPage;
  adminApi: AdminApi;
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
  
  adminApi: async ({ request }, use) => {

    const currentState = await request.storageState();

    const apiContext = await playwrightRequest.newContext({
      storageState: currentState,
    });

    await use(new AdminApi(apiContext));

    await apiContext.dispose();

  },
});

export { expect };