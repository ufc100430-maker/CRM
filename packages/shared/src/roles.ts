/**
 * Ролі і перевірки прав.
 */
export const UserRoles = {
  SELLER: 'SELLER',
  DIRECTOR: 'DIRECTOR',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  REGIONAL_MANAGER: 'REGIONAL_MANAGER',
  ACCOUNTANT: 'ACCOUNTANT',
  SERVICE_ENGINEER: 'SERVICE_ENGINEER',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

const ROLE_LEVEL: Record<UserRole, number> = {
  SELLER: 10,
  SERVICE_ENGINEER: 15,
  ACCOUNTANT: 18,
  DIRECTOR: 20,
  REGIONAL_MANAGER: 30,
  OWNER: 100,
  ADMIN: 1000,
};

export function roleAtLeast(role: UserRole, min: UserRole): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[min];
}

/** Чи може користувач бачити дані іншого магазину */
export function canAccessOtherStore(role: UserRole): boolean {
  return roleAtLeast(role, 'REGIONAL_MANAGER');
}

/** Чи може створювати магазини / користувачів */
export function canManageOrg(role: UserRole): boolean {
  return roleAtLeast(role, 'OWNER');
}

/** Чи може створювати задачі для інших */
export function canCreateTasks(role: UserRole): boolean {
  return roleAtLeast(role, 'DIRECTOR');
}
