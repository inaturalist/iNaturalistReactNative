import useTranslation from "sharedHooks/useTranslation";
import type { SortDirection, SpeciesCount } from "types/sorting";

// Params for observations/species_counts, which only sorts by count
type SpeciesCountsOrderBy = "count";

export interface SpeciesCountsSortAPIParams {
  order_by: SpeciesCountsOrderBy;
  order: SortDirection;
}

export enum SPECIES_SORT {
  COUNT_DESC = "COUNT_DESC",
  COUNT_ASC = "COUNT_ASC",
}

export interface SpeciesSortLabels {
  label: string;
  text: string;
}

const SPECIES_SORT_TO_SPECIES_COUNTS_PARAMS: Record<SPECIES_SORT, SpeciesCountsSortAPIParams> = {
  [SPECIES_SORT.COUNT_DESC]: { order_by: "count", order: "desc" },
  [SPECIES_SORT.COUNT_ASC]: { order_by: "count", order: "asc" },
};

export const MY_OBSERVATIONS_SPECIES_SORT_OPTIONS: SPECIES_SORT[] = [
  SPECIES_SORT.COUNT_DESC,
  SPECIES_SORT.COUNT_ASC,
];

// idk if these will ever be different but this feels safer
export const EXPLORE_SPECIES_SORT_OPTIONS: SPECIES_SORT[] = [
  SPECIES_SORT.COUNT_DESC,
  SPECIES_SORT.COUNT_ASC,
];

export function useSpeciesSortLabels( ): Record<SPECIES_SORT, SpeciesSortLabels> {
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
  sort: SPECIES_SORT,
): SpeciesCountsSortAPIParams {
  return SPECIES_SORT_TO_SPECIES_COUNTS_PARAMS[sort];
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
