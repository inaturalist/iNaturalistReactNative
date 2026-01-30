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

export enum OBSERVATION_SORT_BY {
  CREATED_AT_DESC = "CREATED_AT_DESC",
  CREATED_AT_ASC = "CREATED_AT_ASC",
  OBSERVED_AT_DESC = "OBSERVED_AT_DESC",
  OBSERVED_AT_ASC = "OBSERVED_AT_ASC",
}

export enum SPECIES_SORT_BY {
  COUNT_DESC = "COUNT_DESC",
  COUNT_ASC = "COUNT_ASC",
}
