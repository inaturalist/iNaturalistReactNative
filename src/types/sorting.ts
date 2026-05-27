import type { RealmTaxon } from "realmModels/types";

export type SortItemType = "observations" | "taxa";

export type SortDirection = "asc" | "desc";

export enum OBSERVATIONS_SORT {
  DATE_UPLOADED_NEWEST = "DATE_UPLOADED_NEWEST",
  DATE_UPLOADED_OLDEST = "DATE_UPLOADED_OLDEST",
  DATE_OBSERVED_NEWEST = "DATE_OBSERVED_NEWEST",
  DATE_OBSERVED_OLDEST = "DATE_OBSERVED_OLDEST",
  MOST_FAVED = "MOST_FAVED",
}

// eventually this will be a union type that accounts for different types of sorting, i.e. name
export type SpeciesSortBy = "count"

export interface ObservationSort {
  by:
    | "created_at"
    | "observed_on";
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
