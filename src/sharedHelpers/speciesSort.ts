import useTranslation from "sharedHooks/useTranslation";
import type { SortDirection, SpeciesCount } from "types/sorting";

export type SpeciesOrderBy = "count";

interface SpeciesSortAPIParams {
  order_by: SpeciesOrderBy;
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

const SPECIES_SORT_TO_API_PARAMS: Record<SPECIES_SORT, SpeciesSortAPIParams> = {
  [SPECIES_SORT.COUNT_DESC]: { order_by: "count", order: "desc" },
  [SPECIES_SORT.COUNT_ASC]: { order_by: "count", order: "asc" },
};

// TODO: ExploreV2 will support additional species sort options
// (observed by me, not observed by me).
// MyObs will have these count only, but we'll want to define sort options for explore
export const MY_OBSERVATIONS_SPECIES_SORT_OPTIONS: SPECIES_SORT[] = [
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

export function speciesSortToApiParams( sort: SPECIES_SORT ): SpeciesSortAPIParams {
  return SPECIES_SORT_TO_API_PARAMS[sort];
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
