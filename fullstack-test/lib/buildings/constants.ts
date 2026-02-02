// DPE rating order for comparison (A is best, G is worst)
export const DPE_ORDER = ["A", "B", "C", "D", "E", "F", "G"] as const;
export type Dpe = (typeof DPE_ORDER)[number];

export const SORT_FIELDS = ["name", "dpe", "city", "constructionYear"] as const;
export type SortField = (typeof SORT_FIELDS)[number];

// Available building usage types
export const BUILDING_USAGES = [
  "residential",
  "office",
  "healthcare",
  "retail",
  "school",
  "hotel",
  "university",
  "public",
  "childcare",
  "sports",
  "industrial",
] as const;

export type BuildingUsage = (typeof BUILDING_USAGES)[number];