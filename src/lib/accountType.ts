import type { User } from '@supabase/supabase-js';

export const SUPER_ADMIN_EMAIL = 'krs715665@gmail.com';
export type AccountType = 'shopkeeper' | 'wholesaler' | 'customer';

export function isSuperAdmin(user: User | null): boolean {
  return !!user && user.email === SUPER_ADMIN_EMAIL;
}

export function homePathFor(accountType: AccountType | null | undefined, isSuper: boolean): string {
  if (isSuper) return '/admin';
  switch (accountType) {
    case 'wholesaler': return '/wholesale';
    case 'customer': return '/customer';
    default: return '/dashboard';
  }
}
