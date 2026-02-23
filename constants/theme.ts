export const Colors = {
  teal: "#3D7A6E",
  tealLight: "#5A9E90",
  tealPale: "#EAF4F2",
  sand: "#F5EFE6",
  sandDark: "#E8DDD0",
  bark: "#6B5744",
  bark2: "#4A3728",
  moss: "#8FAF72",
  mossPale: "#EDF5E4",
  dusk: "#B07D6C",
  dawn: "#F2C9A0",
  cream: "#FDFAF6",
  ink: "#2A2018",
  inkMid: "#5C4F3F",
  inkLight: "#9A8C7C",
  gold: "#C9961A",
  goldPale: "#FDF3E7",
  lav: "#8B7EC8",
  lavPale: "#F0EDF8",
  sky: "#5A8FC9",
  skyPale: "#EBF2FA",
} as const;

export const LogTypes = {
  feed: { label: "Feeding", color: "#B07D6C", hasTimer: true },
  sleep: { label: "Sleep", color: "#5A8FC9", hasTimer: true },
  diaper: { label: "Diaper", color: "#8FAF72", hasTimer: false },
  milestone: { label: "Milestone", color: "#C9961A", hasTimer: false },
  health: { label: "Health", color: "#8B7EC8", hasTimer: false },
} as const;

export type LogType = keyof typeof LogTypes;
