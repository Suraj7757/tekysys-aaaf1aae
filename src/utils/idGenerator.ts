import { User } from "@supabase/supabase-js";

/**
 * Generates a tracking ID based on user info.
 * Format: [username][last4mobile][type][serial]
 * Example: hari4599job000001
 */
export function formatTrackingId(user: User, type: 'job' | 'sell', rawSerial: string): string {
  // Use first 6 chars of user UUID for safe distinct segment
  const userSegment = user.id.slice(0, 6).toUpperCase();
  
  // Extract number from serial (e.g. "JOB000001" -> "000001")
  const serialNumber = rawSerial.replace(/\D/g, '');
  
  // Format: ABCDEF-JOB-000001
  return `${userSegment}-${type.toUpperCase()}-${serialNumber}`;
}
