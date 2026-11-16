import type { ApiProjectSummary, ApiTotalBounds, ApiUser } from "api/types";
import type { IDENTIFIERS_TAB, OBSERVERS_TAB, SPECIES_TAB } from "appConstants/tabs";
import { OBSERVATIONS_TAB } from "appConstants/tabs";
import type { ExploreEntryParams } from "navigation/types";
import * as React from "react";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import type { SpeciesCountsSort } from "sharedHelpers/speciesSort";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";

export enum EXPLORE_ACTION {
  SET_SUBJECT = "SET_SUBJECT",
  CLEAR_SUBJECT = "CLEAR_SUBJECT",
  SET_LOCATION_NEARBY = "SET_LOCATION_NEARBY",
  SET_LOCATION_WORLDWIDE = "SET_LOCATION_WORLDWIDE",
  SET_LOCATION_PLACE = "SET_LOCATION_PLACE",
  SET_LOCATION_MAP_AREA = "SET_LOCATION_MAP_AREA",
  SET_SORT = "SET_SORT",
  SET_SPECIES_SORT = "SET_SPECIES_SORT",
  SET_FILTERS = "SET_FILTERS",
  SET_ACTIVE_TAB = "SET_ACTIVE_TAB",
  APPLY_SEARCH = "APPLY_SEARCH",
  RESET = "RESET"
}

export enum EXPLORE_PLACE_MODE {
  NEARBY = "NEARBY",
  WORLDWIDE = "WORLDWIDE",
  PLACE = "PLACE",
  MAP_AREA = "MAP_AREA"
}

export enum TAXONOMIC_RANK {
  none = "none",
  kingdom = "kingdom",
  phylum = "phylum",
  subphylum = "subphylum",
  superclass = "superclass",
  class = "class",
  subclass = "subclass",
  infraclass = "infraclass",
  subterclass = "subterclass",
  superorder = "superorder",
  order = "order",
  suborder = "suborder",
  infraorder = "infraorder",
  parvorder = "parvorder",
  zoosection = "zoosection",
  zoosubsection = "zoosubsection",
  superfamily = "superfamily",
  epifamily = "epifamily",
  family = "family",
  subfamily = "subfamily",
  supertribe = "supertribe",
  tribe = "tribe",
  subtribe = "subtribe",
  genus = "genus",
  genushybrid = "genushybrid",
  subgenus = "subgenus",
  section = "section",
  subsection = "subsection",
  complex = "complex",
  species = "species",
  hybrid = "hybrid",
  subspecies = "subspecies",
  variety = "variety",
  form = "form",
  infrahybrid = "infrahybrid",
}

export enum DATE_OBSERVED {
  ALL = "ALL",
  EXACT_DATE = "EXACT_DATE",
  DATE_RANGE = "DATE_RANGE",
  MONTHS = "MONTHS",
}

export enum DATE_UPLOADED {
  ALL = "ALL",
  EXACT_DATE = "EXACT_DATE",
  DATE_RANGE = "DATE_RANGE"
}

export enum MEDIA {
  ALL = "ALL",
  PHOTOS = "PHOTOS",
  SOUNDS = "SOUNDS",
  NONE = "NONE"
}

export enum ESTABLISHMENT_MEAN {
  ANY = "ANY",
  INTRODUCED = "INTRODUCED",
  NATIVE = "NATIVE",
  ENDEMIC = "ENDEMIC"
}

export enum WILD_STATUS {
  ALL = "ALL",
  WILD = "WILD",
  CAPTIVE = "CAPTIVE"
}

export enum REVIEWED {
  ALL = "ALL",
  // eslint-disable-next-line @typescript-eslint/no-shadow
  REVIEWED = "REVIEWED",
  UNREVIEWED = "UNREVIEWED"
}

export enum PHOTO_LICENSE {
  ALL = "ALL",
  CC0 = "CC0",
  CCBY = "CCBY",
  CCBYNC = "CCBYNC",
  CCBYSA = "CCBYSA",
  CCBYND = "CCBYND",
  CCBYNCSA = "CCBYNCSA",
  CCBYNCND = "CCBYNCND",
}

export interface Place {
  id: number;
  display_name?: string;
  place_type?: number | null;
}

interface Taxon {
  id: number;
  name: string;
  preferred_common_name?: string;
  default_photo?: { url?: string };
  iconic_taxon_name?: string;
  rank_level?: number;
}

interface User {
  id: number;
  login: string;
  icon_url?: string;
  observations_count?: number;
}

export type ExploreTab =
  | typeof OBSERVATIONS_TAB
  | typeof SPECIES_TAB
  | typeof OBSERVERS_TAB
  | typeof IDENTIFIERS_TAB;

export type ExploreSubject =
  | { type: "taxon"; taxon: Taxon }
  | { type: "user"; user: User }
  | { type: "project"; project: ApiProjectSummary }
  | { type: "unobserved"; user: User }
  | { type: "unknown" };

export interface ExploreFilters {
  // Quality grade
  researchGrade: boolean;
  needsID: boolean;
  casual: boolean;
  // Taxonomic ranks
  hrank?: TAXONOMIC_RANK | null;
  lrank?: TAXONOMIC_RANK | null;
  // Date observed
  dateObserved: DATE_OBSERVED;
  observed_on?: string | null;
  d1?: string | null;
  d2?: string | null;
  months?: number[] | null;
  // Date uploaded
  dateUploaded: DATE_UPLOADED;
  created_on?: string | null;
  created_d1?: string | null;
  created_d2?: string | null;
  // Single-select filters
  media: MEDIA;
  establishmentMean: ESTABLISHMENT_MEAN;
  wildStatus: WILD_STATUS;
  reviewedFilter: REVIEWED;
  photoLicense: PHOTO_LICENSE;
  // User / project, in Explore parlance we always consider taxon to be the "subject"
  user?: ApiUser | null;
  unobservedByUser?: ApiUser | null;
  project?: ApiProjectSummary | null;
}

export const defaultExploreFilters: ExploreFilters = {
  researchGrade: true,
  needsID: true,
  casual: false,
  hrank: null,
  lrank: null,
  dateObserved: DATE_OBSERVED.ALL,
  dateUploaded: DATE_UPLOADED.ALL,
  media: MEDIA.ALL,
  establishmentMean: ESTABLISHMENT_MEAN.ANY,
  wildStatus: WILD_STATUS.ALL,
  reviewedFilter: REVIEWED.ALL,
  photoLicense: PHOTO_LICENSE.ALL,
};

export type ExploreLocationState =
  | { placeMode: EXPLORE_PLACE_MODE.WORLDWIDE }
  | { placeMode: EXPLORE_PLACE_MODE.NEARBY }
  | { placeMode: EXPLORE_PLACE_MODE.PLACE; place: Place }
  | { placeMode: EXPLORE_PLACE_MODE.MAP_AREA; bounds: ApiTotalBounds };

export interface ExploreState {
  subject: ExploreSubject | null;
  location: ExploreLocationState;
  sortBy: OBSERVATIONS_SORT;
  speciesSortBy: SpeciesCountsSort;
  filters: ExploreFilters;
  activeTab: ExploreTab;
  // Bumped each time a whole search is applied from outside the results screen, e.g. a
  // saved search. Lets a view tell "the search moved out from under me" apart from
  // "the same search re-rendered", which the search fields alone can't when they're equal.
  appliedSearchCount: number;
}

// Everything that defines a search, as opposed to how the results are being viewed
export type ExploreSearch = Omit<ExploreState, "activeTab" | "appliedSearchCount">;

export type ExploreAction =
  | { type: EXPLORE_ACTION.SET_SUBJECT; subject: ExploreSubject }
  | { type: EXPLORE_ACTION.CLEAR_SUBJECT }
  | { type: EXPLORE_ACTION.SET_LOCATION_NEARBY }
  | { type: EXPLORE_ACTION.SET_LOCATION_WORLDWIDE }
  | {
    type: EXPLORE_ACTION.SET_LOCATION_PLACE;
    place: Place;
  }
  | {
    type: EXPLORE_ACTION.SET_LOCATION_MAP_AREA;
    bounds: ApiTotalBounds;
  }
  | { type: EXPLORE_ACTION.SET_SORT; sortBy: OBSERVATIONS_SORT }
  | { type: EXPLORE_ACTION.SET_SPECIES_SORT; speciesSortBy: SpeciesCountsSort }
  | { type: EXPLORE_ACTION.SET_FILTERS; filters: ExploreFilters }
  | { type: EXPLORE_ACTION.SET_ACTIVE_TAB; tab: ExploreTab }
  | { type: EXPLORE_ACTION.APPLY_SEARCH; search: ExploreSearch }
  | { type: EXPLORE_ACTION.RESET };

export const initialExploreState: ExploreState = {
  subject: null,
  location: { placeMode: EXPLORE_PLACE_MODE.NEARBY },
  sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
  speciesSortBy: SPECIES_SORT.COUNT_DESC,
  filters: defaultExploreFilters,
  activeTab: OBSERVATIONS_TAB,
  appliedSearchCount: 0,
};

export function initialStateFromEntryParams(
  params?: ExploreEntryParams | null,
): ExploreState {
  const base = {
    ...initialExploreState,
    ...params?.search,
  };
  return {
    ...base,
    subject: params?.subject || base.subject,
    location: params?.location || base.location,
    activeTab: params?.activeTab || base.activeTab,
  };
}

export function exploreReducer(
  state: ExploreState,
  action: ExploreAction,
): ExploreState {
  switch ( action.type ) {
    case EXPLORE_ACTION.SET_SUBJECT:
      return { ...state, subject: action.subject };
    case EXPLORE_ACTION.CLEAR_SUBJECT:
      return { ...state, subject: null };
    case EXPLORE_ACTION.SET_LOCATION_NEARBY:
      return {
        ...state,
        location: { placeMode: EXPLORE_PLACE_MODE.NEARBY },
      };
    case EXPLORE_ACTION.SET_LOCATION_WORLDWIDE:
      return {
        ...state,
        location: { placeMode: EXPLORE_PLACE_MODE.WORLDWIDE },
      };
    case EXPLORE_ACTION.SET_LOCATION_PLACE:
      return {
        ...state,
        location: {
          placeMode: EXPLORE_PLACE_MODE.PLACE,
          place: action.place,
        },
      };
    case EXPLORE_ACTION.SET_LOCATION_MAP_AREA:
      return {
        ...state,
        location: {
          placeMode: EXPLORE_PLACE_MODE.MAP_AREA,
          bounds: action.bounds,
        },
      };
    case EXPLORE_ACTION.SET_SORT:
      return { ...state, sortBy: action.sortBy };
    case EXPLORE_ACTION.SET_SPECIES_SORT:
      return { ...state, speciesSortBy: action.speciesSortBy };
    case EXPLORE_ACTION.SET_FILTERS:
      return { ...state, filters: action.filters };
    case EXPLORE_ACTION.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.tab };
    case EXPLORE_ACTION.APPLY_SEARCH: {
      const {
        subject, location, sortBy, speciesSortBy, filters,
      } = action.search;
      return {
        ...state,
        subject,
        location,
        sortBy,
        speciesSortBy,
        filters,
        appliedSearchCount: state.appliedSearchCount + 1,
      };
    }
    case EXPLORE_ACTION.RESET:
      return initialExploreState;
    default: {
      // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

interface ExploreContextValue {
  state: ExploreState;
  dispatch: ( action: ExploreAction ) => void;
}

const ExploreContext = React.createContext<ExploreContextValue | undefined>(
  undefined,
);

interface ExploreProviderProps {
  children: React.ReactNode;
  initialState: ExploreState;
}

export const ExploreProvider = ( { children, initialState }: ExploreProviderProps ) => {
  const [state, dispatch] = React.useReducer( exploreReducer, initialState );

  const value = React.useMemo(
    () => ( { state, dispatch } ),
    [state],
  );

  return (
    <ExploreContext value={value}>
      {children}
    </ExploreContext>
  );
};

export function useExplore( ): ExploreContextValue {
  const context = React.useContext( ExploreContext );
  // Pattern from https://kentcdodds.com/blog/how-to-use-react-context-effectively
  if ( context === undefined ) {
    throw new Error( "useExplore must be used within an ExploreProvider" );
  }
  return context;
}
