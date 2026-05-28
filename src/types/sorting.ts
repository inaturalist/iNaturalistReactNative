import type { RealmTaxon } from "realmModels/types";

export type SortDirection = "asc" | "desc";
export type ObservationOrderBy = "created_at" | "observed_on" | "votes";

export interface SpeciesCount {
  count: number;
  taxon: RealmTaxon;
}
