import type { RealmTaxon } from "realmModels/types";

export type SortDirection = "asc" | "desc";
export type ObservationOrderBy = "created_at" | "observed_on" | "votes";

export interface SpeciesCount {
  count: number;
  taxon: RealmTaxon;
  // YYYY-MM-DD, only present on results from users/:id/taxa_observed
  first_observed_on?: string | null;
}
