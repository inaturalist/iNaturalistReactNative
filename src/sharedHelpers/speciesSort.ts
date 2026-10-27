import useTranslation from "sharedHooks/useTranslation";
import type { SortDirection, SpeciesCount } from "types/sorting";

// Params for observations/species_counts, which only sorts by count
type SpeciesCountsOrderBy = "count";

export interface SpeciesCountsSortAPIParams {
  order_by: SpeciesCountsOrderBy;
  order: SortDirection;
}

// Params for users/:id/taxa_observed, which we only use for sorting by the date a
// species was first observed, since it's more expensive than using species_counts
type TaxaObservedOrderBy = "first_observed_on";

export interface TaxaObservedSortAPIParams {
  order_by: TaxaObservedOrderBy;
  order: SortDirection;
}

export enum SPECIES_SORT {
  COUNT_DESC = "COUNT_DESC",
  COUNT_ASC = "COUNT_ASC",
  DATE_OBSERVED_NEWEST = "DATE_OBSERVED_NEWEST",
  DATE_OBSERVED_OLDEST = "DATE_OBSERVED_OLDEST",
}

// Sorts that observations/species_counts supports. Date sorts are MyObs-only, since
// taxa_observed is scoped to a single user
export type SpeciesCountsSort = SPECIES_SORT.COUNT_DESC | SPECIES_SORT.COUNT_ASC;
type TaxaObservedSort = Exclude<SPECIES_SORT, SpeciesCountsSort>;

export function isSpeciesCountsSort( sort: SPECIES_SORT ): sort is SpeciesCountsSort {
  return sort === SPECIES_SORT.COUNT_DESC || sort === SPECIES_SORT.COUNT_ASC;
}

export interface SpeciesSortLabels {
  label: string;
  text: string;
}

const SPECIES_SORT_TO_SPECIES_COUNTS_PARAMS: Record<
  SpeciesCountsSort,
  SpeciesCountsSortAPIParams
> = {
  [SPECIES_SORT.COUNT_DESC]: { order_by: "count", order: "desc" },
  [SPECIES_SORT.COUNT_ASC]: { order_by: "count", order: "asc" },
};

const SPECIES_SORT_TO_TAXA_OBSERVED_PARAMS: Record<
  TaxaObservedSort,
  TaxaObservedSortAPIParams
> = {
  [SPECIES_SORT.DATE_OBSERVED_NEWEST]: { order_by: "first_observed_on", order: "desc" },
  [SPECIES_SORT.DATE_OBSERVED_OLDEST]: { order_by: "first_observed_on", order: "asc" },
};

// TODO: offer the date sorts here once they have labels (MOB-1667)
export const MY_OBSERVATIONS_SPECIES_SORT_OPTIONS: SpeciesCountsSort[] = [
  SPECIES_SORT.COUNT_DESC,
  SPECIES_SORT.COUNT_ASC,
];

export const EXPLORE_SPECIES_SORT_OPTIONS: SpeciesCountsSort[] = [
  SPECIES_SORT.COUNT_DESC,
  SPECIES_SORT.COUNT_ASC,
];

export function useSpeciesSortLabels( ): Record<SpeciesCountsSort, SpeciesSortLabels> {
  const { t } = useTranslation( );
  return {
    [SPECIES_SORT.COUNT_DESC]: {
      label: t( "Most-Observed-Default" ),
      text: t( "Species-with-the-most-observations-appear-first" ),
    },
    [SPECIES_SORT.COUNT_ASC]: {
      label: t( "Least-Observed" ),
      text: t( "Species-with-the-least-observations-appear-first" ),
    },
  };
}

export function speciesSortToSpeciesCountsParams(
  sort: SpeciesCountsSort,
): SpeciesCountsSortAPIParams {
  return SPECIES_SORT_TO_SPECIES_COUNTS_PARAMS[sort];
}

export function speciesSortToTaxaObservedParams(
  sort: TaxaObservedSort,
): TaxaObservedSortAPIParams {
  return SPECIES_SORT_TO_TAXA_OBSERVED_PARAMS[sort];
}

export function sortSpeciesCounts<T extends SpeciesCount>(
  speciesCounts: T[],
  sortOptionId: SPECIES_SORT,
): T[] {
  const sorted = [...speciesCounts];

  sorted.sort( ( a, b ) => {
    const diff = a.count - b.count;
    return sortOptionId === SPECIES_SORT.COUNT_ASC
      ? diff
      : -diff;
  } );

  return sorted;
}
