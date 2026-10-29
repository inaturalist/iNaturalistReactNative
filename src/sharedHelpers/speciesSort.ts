import type { RealmObservation } from "realmModels/types";
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

export const MY_OBSERVATIONS_SPECIES_SORT_OPTIONS: SPECIES_SORT[] = [
  SPECIES_SORT.COUNT_DESC,
  SPECIES_SORT.COUNT_ASC,
  SPECIES_SORT.DATE_OBSERVED_NEWEST,
  SPECIES_SORT.DATE_OBSERVED_OLDEST,
];

export const EXPLORE_SPECIES_SORT_OPTIONS: SpeciesCountsSort[] = [
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
    [SPECIES_SORT.DATE_OBSERVED_NEWEST]: {
      label: t( "Date-Observed-Newest" ),
      text: t( "Species-first-observed-recently-appear-first" ),
    },
    [SPECIES_SORT.DATE_OBSERVED_OLDEST]: {
      label: t( "Date-Observed-Oldest" ),
      text: t( "Species-first-observed-least-recently-appear-first" ),
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

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;

// Local stand-in for taxa_observed's first_observed_on, for signed-out users. Prefers
// observed_on, which the server sets on upload as the observation's local date. Local-only
// observations only have observed_on_string (e.g. "2026-10-09T14:30"), so we fall back to
// its date part. Strings from other clients can be in UTC (e.g. "2026-10-12 02:15:00Z"),
// where the date part can be a day off, which is why observed_on should come first
export function earliestObservedOn(
  observations: Pick<RealmObservation, "observed_on" | "observed_on_string">[],
): string | null {
  return observations.reduce<string | null>( ( earliest, observation ) => {
    const observedOn = (
      observation.observed_on || observation.observed_on_string || ""
    ).match( DATE_PREFIX )?.[0];
    if ( !observedOn ) return earliest;
    return !earliest || observedOn < earliest
      ? observedOn
      : earliest;
  }, null );
}

// Matches taxa_observed: species without a first observed date go last in both
// directions, and ties are broken by taxon id ascending
function compareFirstObservedOn(
  a: SpeciesCount,
  b: SpeciesCount,
  order: SortDirection,
): number {
  const aDate = a.first_observed_on;
  const bDate = b.first_observed_on;
  if ( aDate !== bDate ) {
    if ( !aDate ) return 1;
    if ( !bDate ) return -1;
    const diff = aDate < bDate
      ? -1
      : 1;
    return order === "asc"
      ? diff
      : -diff;
  }
  return a.taxon.id - b.taxon.id;
}

export function sortSpeciesCounts<T extends SpeciesCount>(
  speciesCounts: T[],
  sortOptionId: SPECIES_SORT,
): T[] {
  const sorted = [...speciesCounts];

  sorted.sort( ( a, b ) => {
    if ( sortOptionId === SPECIES_SORT.DATE_OBSERVED_NEWEST ) {
      return compareFirstObservedOn( a, b, "desc" );
    }
    if ( sortOptionId === SPECIES_SORT.DATE_OBSERVED_OLDEST ) {
      return compareFirstObservedOn( a, b, "asc" );
    }
    const diff = a.count - b.count;
    return sortOptionId === SPECIES_SORT.COUNT_ASC
      ? diff
      : -diff;
  } );

  return sorted;
}
