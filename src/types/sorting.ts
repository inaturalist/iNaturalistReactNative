import type { RealmTaxon } from "realmModels/types";

export type SortItemType = "observations" | "taxa";

export type SortDirection = "asc" | "desc";

export interface ObservationSort {
  by:
    | "created_at"
    | "observed_at";
  direction?: SortDirection;
}

export interface SpeciesSort {
  by:
    | "count";
  direction?: SortDirection;
}

export interface SpeciesCount {
  count: number;
  taxon: RealmTaxon;
}

export type ObservationSortOptionId =
  | "created_at_desc"
  | "created_at_asc"
  | "observed_at_desc"
  | "observed_at_asc"

export type SpeciesSortOptionId =
  | "count_desc"
  | "count_asc"
