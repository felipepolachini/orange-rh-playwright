const API_BASE_PATH = process.env.API_BASE_PATH ?? 'web/index.php/api/v2';

export const ApiRoutes = {
    adminUsers: `/${API_BASE_PATH}/admin/users`,
    pimEmployees: `/${API_BASE_PATH}/pim/employees`,
};