import useTranslation from "sharedHooks/useTranslation";
import type { ObservationOrderBy, SortDirection } from "types/sorting";

export enum OBSERVATIONS_SORT {
  DATE_UPLOADED_NEWEST = "DATE_UPLOADED_NEWEST",
  DATE_UPLOADED_OLDEST = "DATE_UPLOADED_OLDEST",
  DATE_OBSERVED_NEWEST = "DATE_OBSERVED_NEWEST",
  DATE_OBSERVED_OLDEST = "DATE_OBSERVED_OLDEST",
  MOST_FAVED = "MOST_FAVED",
}

// Most faved is only offered in Explore
export type MyObservationsSort = Exclude<OBSERVATIONS_SORT, OBSERVATIONS_SORT.MOST_FAVED>;

interface ObservationSortAPIParams {
  order_by: ObservationOrderBy;
  order: SortDirection;
}

export interface ObservationSortLabels {
  label: string;
  text: string;
}

const OBSERVATIONS_SORT_TO_API_PARAMS: Record<OBSERVATIONS_SORT, ObservationSortAPIParams> = {
  [OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST]: { order_by: "created_at", order: "desc" },
  [OBSERVATIONS_SORT.DATE_UPLOADED_OLDEST]: { order_by: "created_at", order: "asc" },
  [OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST]: { order_by: "observed_on", order: "desc" },
  [OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST]: { order_by: "observed_on", order: "asc" },
  [OBSERVATIONS_SORT.MOST_FAVED]: { order_by: "votes", order: "desc" },
};

export const MY_OBSERVATIONS_SORT_OPTIONS: MyObservationsSort[] = [
  OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
  OBSERVATIONS_SORT.DATE_UPLOADED_OLDEST,
  OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST,
  OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
];

export const EXPLORE_OBSERVATIONS_SORT_OPTIONS: OBSERVATIONS_SORT[] = [
  OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
  OBSERVATIONS_SORT.DATE_UPLOADED_OLDEST,
  OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST,
  OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
];

export const ADVANCED_SEARCH_OBSERVATIONS_SORT_OPTIONS: OBSERVATIONS_SORT[] = [
  ...EXPLORE_OBSERVATIONS_SORT_OPTIONS,
  OBSERVATIONS_SORT.MOST_FAVED,
];

export function observationSortToApiParams( sort: OBSERVATIONS_SORT ): ObservationSortAPIParams {
  return OBSERVATIONS_SORT_TO_API_PARAMS[sort];
}

// [property, reverse] tuple, matching Realm's .sorted() argument shape
type ObservationRealmSort = [string, boolean];

const OBSERVATIONS_SORT_TO_REALM_SORT: Record<MyObservationsSort, ObservationRealmSort> = {
  [OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST]: ["_created_at", true],
  [OBSERVATIONS_SORT.DATE_UPLOADED_OLDEST]: ["_created_at", false],
  // observed_on (a real date) is only populated once an observation has been uploaded and the
  // server computes it -- local-only observations only ever have the
  // observed_on_string set, so local sorting needs to use that field instead
  [OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST]: ["observed_on_string", true],
  [OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST]: ["observed_on_string", false],
};

// For sorting local, unsynced observations directly in a Realm query -- used for logged-out
// users, who can never have server-ordered observations
export function observationSortToRealmSort( sort: MyObservationsSort ): ObservationRealmSort {
  return OBSERVATIONS_SORT_TO_REALM_SORT[sort];
}

export function useObservationsSortLabels( ): Record<OBSERVATIONS_SORT, ObservationSortLabels> {
  const { t } = useTranslation( );
  return {
    [OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST]: {
      label: t( "Date-Added-Newest-Default" ),
      text: t( "Observations-added-recently-appear-first" ),
    },
    [OBSERVATIONS_SORT.DATE_UPLOADED_OLDEST]: {
      label: t( "Date-Added-Oldest" ),
      text: t( "Observations-added-least-recently-appear-first" ),
    },
    [OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST]: {
      label: t( "Date-Observed-Newest" ),
      text: t( "Observations-with-the-most-recent-date-appear-first" ),
    },
    [OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST]: {
      label: t( "Date-Observed-Oldest" ),
      text: t( "Observations-with-the-oldest-date-appear-first" ),
    },
    [OBSERVATIONS_SORT.MOST_FAVED]: {
      label: t( "Most-faved" ),
      text: t( "Observations-with-the-most-faves-appear-first" ),
    },
  };
}
