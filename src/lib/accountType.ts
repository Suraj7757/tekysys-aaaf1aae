import type { User } from "@supabase/supabase-js";

export const SUPER_ADMIN_EMAIL = "krs715665@gmail.com";
export type AccountType = "shopkeeper" | "wholesaler" | "customer";

export type AppRole =
  | "admin"
  | "staff"
  | "customer"
  | "shopkeeper"
  | "wholesaler";

export function isSuperAdmin(role?: string | null): boolean {
  return role === "admin";
}

export function homePathFor(
  accountType: AccountType | null | undefined,
  isSuper: boolean,
): string {
  if (isSuper) return "/admin";
  switch (accountType) {
    case "wholesaler":
      return "/wholesale";
    case "customer":
      return "/customer";
    default:
      return "/dashboard";
  }
}
