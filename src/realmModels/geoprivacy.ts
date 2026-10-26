export const GEOPRIVACY_OPEN = "open" as const;
export const GEOPRIVACY_OBSCURED = "obscured" as const;
export const GEOPRIVACY_PRIVATE = "private" as const;

export type Geoprivacy =
  | null
  | typeof GEOPRIVACY_OPEN
  | typeof GEOPRIVACY_OBSCURED
  | typeof GEOPRIVACY_PRIVATE;
