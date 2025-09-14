export type Tag = {
  id: string;
  label: string;
  type: "studioA" | "studioB" | "addon"; // restricts to valid values
  hex?: string; // only for Studio A backdrops
};
