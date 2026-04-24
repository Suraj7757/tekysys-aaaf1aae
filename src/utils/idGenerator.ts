import { User } from "@supabase/supabase-js";

/**
 * Generates a tracking ID based on user info.
 * Format: 10-12 digit alphanumeric mix for secure tracking
 */
export function formatTrackingId(_user: User, _type: 'job' | 'sell', _rawSerial: string): string {
  // Generate a random 12-character alphanumeric string
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
