export interface Family {
  id: string;
  created_at: string;
  family_name: string | null;
  invite_code: string;
}

export interface Profile {
  id: string;
  family_id: string;
  display_name: string;
  role: "mom" | "dad" | "grandparent" | "caregiver";
  avatar_url: string | null;
  push_token: string | null;
  created_at: string;
}

export interface Baby {
  id: string;
  family_id: string;
  name: string;
  date_of_birth: string;
  sex: "girl" | "boy" | null;
  photo_url: string | null;
  created_at: string;
}

export interface Log {
  id: string;
  baby_id: string;
  family_id: string;
  logged_by: string;
  type: "feed" | "sleep" | "diaper" | "health" | "milestone";
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  profile?: Pick<Profile, "display_name" | "role">;
}

export interface Milestone {
  id: string;
  baby_id: string;
  family_id: string;
  logged_by: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  happened_at: string;
  created_at: string;
}
