import type { Baby } from "../../types";

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function formatBabyAge(baby: Baby | null | undefined): string {
  if (!baby?.date_of_birth) return "";
  const dob = new Date(baby.date_of_birth);
  const now = new Date();
  const totalDays = Math.floor(
    (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (totalDays < 7) {
    return `${totalDays} ${totalDays === 1 ? "day" : "days"} old`;
  }

  const months = Math.floor(
    (now.getFullYear() - dob.getFullYear()) * 12 +
      (now.getMonth() - dob.getMonth()),
  );
  const weeks = Math.floor(
    ((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 7)) % 4,
  );

  const mLabel = months === 1 ? "month" : "months";
  const wLabel = weeks === 1 ? "week" : "weeks";

  if (months === 0) return `${weeks} ${wLabel} old`;
  if (weeks === 0) return `${months} ${mLabel} old`;
  return `${months} ${mLabel} · ${weeks} ${wLabel} old`;
}
