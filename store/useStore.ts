import { create } from "zustand";
import type { Baby, Profile } from "../types";

interface ActiveLog {
  id: string;
  type: "feed" | "sleep";
  started_at: string;
  baby_id: string;
  /** Nursing side when type is "feed" — used for timer display */
  side?: "left" | "right";
  /** Left/right durations when nursing with side switching */
  leftDuration?: number;
  rightDuration?: number;
}

interface CovaStore {
  profile: Profile | null;
  activeBaby: Baby | null;
  activeLog: ActiveLog | null;
  setProfile: (p: Profile | null) => void;
  setActiveBaby: (b: Baby | null) => void;
  setActiveLog: (log: ActiveLog | null) => void;
}

export const useStore = create<CovaStore>((set) => ({
  profile: null,
  activeBaby: null,
  activeLog: null,
  setProfile: (profile) => set({ profile }),
  setActiveBaby: (activeBaby) => set({ activeBaby }),
  setActiveLog: (activeLog) => set({ activeLog }),
}));
