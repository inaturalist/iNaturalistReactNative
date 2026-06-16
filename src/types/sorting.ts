import type { RealmTaxon } from "realmModels/types";

export type SortDirection = "asc" | "desc";
export type ObservationOrderBy = "created_at" | "observed_on";

export interface SpeciesCount {
  count: number;
  taxon: RealmTaxon;
}
