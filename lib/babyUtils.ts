import { supabase } from "./supabase";
import type { Baby } from "../types";

export const PHOTO_BUCKET = "baby-photos";

export async function ensureBucket(): Promise<void> {
  const { data } = await supabase.storage.getBucket(PHOTO_BUCKET);
  if (!data) {
    await supabase.storage.createBucket(PHOTO_BUCKET, { public: true });
  }
}

/**
 * Computes a human-readable age string from a baby's date of birth.
 * Examples: "3 days old", "2 months · 1 week old"
 */
export function calcAge(baby: Baby | null | undefined): string {
  if (!baby?.date_of_birth) return "";
  const dob = new Date(baby.date_of_birth);
  const now = new Date();
  const totalDays = Math.floor(
    (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (totalDays < 7) {
    return `${totalDays} ${totalDays === 1 ? "day" : "days"} old`;
  }

  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  const weeks = Math.floor(
    ((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 7)) % 4.33,
  );

  const mLabel = months === 1 ? "month" : "months";
  const wLabel = weeks === 1 ? "week" : "weeks";

  if (months === 0) return `${weeks} ${wLabel} old`;
  if (weeks === 0) return `${months} ${mLabel} old`;
  return `${months} ${mLabel} · ${weeks} ${wLabel} old`;
}
