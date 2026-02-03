import type { RealmTaxon } from "realmModels/types";

export type SortItemType = "observations" | "taxa";

export type SortDirection = "asc" | "desc";

// eventually this will be a union type that accounts for different types of sorting, i.e. name
export type SpeciesSortBy = "count"

export interface ObservationSort {
  by:
    | "created_at"
    | "observed_at";
  direction?: SortDirection;
}

export interface SpeciesSort {
  by: SpeciesSortBy;
  direction?: SortDirection;
}

export interface SpeciesCount {
  count: number;
  taxon: RealmTaxon;
}

export enum SPECIES_SORT_BY {
  COUNT_DESC = "COUNT_DESC",
  COUNT_ASC = "COUNT_ASC",
}
