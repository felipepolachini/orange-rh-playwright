import { faker } from '@faker-js/faker';

const TEST_DATA_PREFIX = 'qa_';

export interface UserData {
    employeeName: string;
    role: 'Admin' | 'ESS';
    status: 'Enabled' | 'Disabled';
    username: string;
    password: string;
}

function generateValidPassword(length = 12): string {

    const lower = faker.string.alpha({ length: 1, casing: 'lower' });
    const upper = faker.string.alpha({ length: 1, casing: 'upper' });
    const digit = faker.string.numeric(1);

    const remainingLength = length - 3;

    const rest = faker.internet.password({
        length: remainingLength,
        memorable: false,
    });

    const combined = `${lower}${upper}${digit}${rest}`.split('');

    // Embaralha para não deixar um padrão previsível (ex: sempre minúscula
    // na primeira posição), já que alguns sistemas rejeitam senhas com
    // estrutura fixa demais.
    for (let i = combined.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return combined.join('');
}

export function buildUserData(overrides: Partial<UserData> = {}): UserData {
    return {
        employeeName: faker.helpers.arrayElement(['a', 'e', 'i', 'o', 'u']),
        role: 'Admin',
        status: 'Enabled',
        username: `${TEST_DATA_PREFIX}${faker.internet.username().toLowerCase()}`,
        password: generateValidPassword(),
        ...overrides,
    };
}