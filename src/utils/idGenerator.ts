import { User } from "@supabase/supabase-js";

/**
 * Generates a tracking ID based on user info.
 * Format: [username][last4mobile][type][serial]
 * Example: hari4599job000001
 */
export function formatTrackingId(user: User, type: 'job' | 'sell', rawSerial: string): string {
  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'user';
  const mobile = user.user_metadata?.mobile || '0000000000';
  
  // Clean username: lowercase, no spaces
  const cleanName = displayName.toLowerCase().replace(/\s+/g, '').slice(0, 8);
  
  // Last 4 digits of mobile
  const last4 = mobile.slice(-4);
  
  // Extract number from serial (e.g. "JOB000001" -> "000001")
  const serialNumber = rawSerial.replace(/\D/g, '');
  
  return `${cleanName}${last4}${type}${serialNumber}`;
}
