/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
import { isEqual } from "lodash";
import * as React from "react";
import type { LatLng } from "react-native-maps";

// Please don't change this to an aliased path or the e2e mock will not get
// used in our e2e tests on Github Actions
import fetchCoarseUserLocation from "../sharedHelpers/fetchCoarseUserLocation";

export enum EXPLORE_ACTION {
  CHANGE_SORT_BY = "CHANGE_SORT_BY",
  CHANGE_TAXON = "CHANGE_TAXON",
  DISCARD = "DISCARD",
  FILTER_BY_ICONIC_TAXON_UNKNOWN = "FILTER_BY_ICONIC_TAXON_UNKNOWN",
  RESET = "RESET",
  SET_DATE_OBSERVED_ALL = "SET_DATE_OBSERVED_ALL",
  SET_DATE_OBSERVED_EXACT = "SET_DATE_OBSERVED_EXACT",
  SET_DATE_OBSERVED_MONTHS = "SET_DATE_OBSERVED_MONTHS",
  SET_DATE_OBSERVED_RANGE = "SET_DATE_OBSERVED_RANGE",
  SET_DATE_UPLOADED_ALL = "SET_DATE_UPLOADED_ALL",
  SET_DATE_UPLOADED_EXACT = "SET_DATE_UPLOADED_EXACT",
  SET_DATE_UPLOADED_RANGE = "SET_DATE_UPLOADED_RANGE",
  SET_ESTABLISHMENT_MEAN = "SET_ESTABLISHMENT_MEAN",
  SET_EXPLORE_LOCATION = "SET_EXPLORE_LOCATION",
  SET_HIGHEST_TAXONOMIC_RANK = "SET_HIGHEST_TAXONOMIC_RANK",
  SET_LOWEST_TAXONOMIC_RANK = "SET_LOWEST_TAXONOMIC_RANK",
  SET_MAP_BOUNDARIES = "SET_MAP_BOUNDARIES",
  SET_MEDIA = "SET_MEDIA",
  SET_PHOTO_LICENSE = "SET_PHOTO_LICENSE",
  SET_PLACE = "SET_PLACE",
  SET_PLACE_MODE_NEARBY = "SET_PLACE_MODE_NEARBY",
  SET_PLACE_MODE_WORLDWIDE = "SET_PLACE_MODE_WORLDWIDE",
  SET_PLACE_MODE_MAP_AREA = "SET_PLACE_MODE_MAP_AREA",
  SET_PLACE_MODE_PLACE = "SET_PLACE_MODE_PLACE",
  SET_PROJECT = "SET_PROJECT",
  SET_REVIEWED = "SET_REVIEWED",
  SET_TAXON_NAME = "SET_TAXON_NAME",
  SET_USER = "SET_USER",
  SET_EXCLUDE_USER = "SET_EXCLUDE_USER",
  SET_WILD_STATUS = "SET_WILD_STATUS",
  TOGGLE_CASUAL = "TOGGLE_CASUAL",
  TOGGLE_NEEDS_ID = "TOGGLE_NEEDS_ID",
  TOGGLE_RESEARCH_GRADE = "TOGGLE_RESEARCH_GRADE",
  USE_STORED_STATE = "USE_STORED_STATE"
}

export enum SORT_BY {
  DATE_UPLOADED_NEWEST = "DATE_UPLOADED_NEWEST",
  DATE_UPLOADED_OLDEST = "DATE_UPLOADED_OLDEST",
  DATE_OBSERVED_NEWEST = "DATE_OBSERVED_NEWEST",
  DATE_OBSERVED_OLDEST = "DATE_OBSERVED_OLDEST",
  MOST_FAVED = "MOST_FAVED",
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

export enum PLACE_MODE {
  NEARBY = "NEARBY",
  WORLDWIDE = "WORLDWIDE",
  PLACE = "PLACE",
  MAP_AREA = "MAP_AREA"
}

export interface MapBoundaries {
  swlat: LatLng["latitude"];
  swlng: LatLng["longitude"];
  nelat: LatLng["latitude"];
  nelng: LatLng["longitude"];
}

interface PLACE {
  display_name: string;
  id: number;
  place_type: number;
  point_geojson: {
    coordinates: Array<number>;
  };
  bounding_box_geojson?: {
    coordinates: Array<number>;
  };
  type: string;
}

interface DefaultLocation {
  placeMode: PLACE_MODE;
  lat?: number;
  lng?: number;
  radius?: number;
}

type ExploreProviderProps = {children: React.ReactNode}
type State = {
  casual: boolean;
  created_d1: string | null | undefined;
  created_d2: string | null | undefined;
  created_on: string | null | undefined;
  d1: string | null | undefined;
  d2: string | null | undefined;
  dateObserved: DATE_OBSERVED;
  dateUploaded: DATE_UPLOADED;
  establishmentMean: ESTABLISHMENT_MEAN;
  hrank: TAXONOMIC_RANK | undefined | null;
  iconic_taxa: string[] | undefined;
  lat?: number;
  lng?: number;
  lrank: TAXONOMIC_RANK | undefined | null;
  media: MEDIA;
  months: number[] | null | undefined;
  needsID: boolean;
  nelat?: number;
  nelng?: number;
  observed_on: string | null | undefined;
  photoLicense: PHOTO_LICENSE;
  place: PLACE | null | undefined;
  place_guess: string;
  placeMode: PLACE_MODE;
  place_id: number | null | undefined;
  // TODO: technically this is not any object but a "Project"
  // and should be typed as such (e.g., in realm model)
  project: object | undefined | null;
  project_id: number | undefined | null;
  radius?: number;
  researchGrade: boolean;
  return_bounds: boolean | undefined;
  reviewedFilter: REVIEWED;
  sortBy: SORT_BY;
  swlat?: number;
  swlng?: number;
  // TODO: technically this is not any object but a "Taxon"
  // and should be typed as such (e.g., in realm model)
  taxon: object | undefined | null;
  taxon_id: number | undefined | null;
  // TODO: technically this is not any object but a "User"
  // and should be typed as such (e.g., in realm model)
  user: object | undefined | null;
  user_id: number | undefined | null;
  excludeUser: object | undefined | null;
  verifiable: boolean;
  wildStatus: WILD_STATUS;
}
type Action = {type: EXPLORE_ACTION.RESET}
  | {type: EXPLORE_ACTION.DISCARD; snapshot: State}
  | {type: EXPLORE_ACTION.SET_USER; user: object | null; userId: number | null; storedState: State}
  | {
    type: EXPLORE_ACTION.EXCLUDE_USER;
    user: null;
    userId: null;
    excludeUser: object;
    storedState: State;
  }
  | {
    type: EXPLORE_ACTION.CHANGE_TAXON;
    taxon: { id: number } | null;
    taxonId: number;
    taxonName: string;
    storedState?: State;
  }
  | { type: EXPLORE_ACTION.FILTER_BY_ICONIC_TAXON_UNKNOWN }
  | {type: EXPLORE_ACTION.SET_EXPLORE_LOCATION; exploreLocation: DefaultLocation}
  | {
    type: EXPLORE_ACTION.SET_PLACE;
    place: PLACE;
    placeId: number;
    placeGuess?: string;
    lat: number;
    lng: number;
    radius: number;
    storedState: State;
  }
  | {type: EXPLORE_ACTION.SET_PLACE_MODE_NEARBY}
  | {type: EXPLORE_ACTION.SET_PLACE_MODE_WORLDWIDE}
  | {type: EXPLORE_ACTION.SET_PLACE_MODE_MAP_AREA}
  | {type: EXPLORE_ACTION.SET_PLACE_MODE_PLACE}
  | {
      type: EXPLORE_ACTION.SET_PROJECT;
      project: object | null;
      projectId: number | null;
      storedState: State;
    }
  | {type: EXPLORE_ACTION.CHANGE_SORT_BY; sortBy: SORT_BY}
  | {type: EXPLORE_ACTION.TOGGLE_RESEARCH_GRADE}
  | {type: EXPLORE_ACTION.TOGGLE_NEEDS_ID}
  | {type: EXPLORE_ACTION.TOGGLE_CASUAL}
  | {type: EXPLORE_ACTION.SET_HIGHEST_TAXONOMIC_RANK; hrank: TAXONOMIC_RANK}
  | {type: EXPLORE_ACTION.SET_LOWEST_TAXONOMIC_RANK; lrank: TAXONOMIC_RANK}
  | {type: EXPLORE_ACTION.SET_DATE_OBSERVED_ALL}
  | {type: EXPLORE_ACTION.SET_DATE_OBSERVED_EXACT; observedOn: string}
  | {type: EXPLORE_ACTION.SET_DATE_OBSERVED_RANGE; d1: string; d2: string}
  | {type: EXPLORE_ACTION.SET_DATE_OBSERVED_MONTHS; months: number[]}
  | {type: EXPLORE_ACTION.SET_DATE_UPLOADED_ALL}
  | {type: EXPLORE_ACTION.SET_DATE_UPLOADED_EXACT; createdOn: string}
  | {type: EXPLORE_ACTION.SET_DATE_UPLOADED_RANGE; createdD1: string; createdD2: string}
  | {type: EXPLORE_ACTION.SET_MEDIA; media: MEDIA}
  | {type: EXPLORE_ACTION.SET_ESTABLISHMENT_MEAN; establishmentMean: ESTABLISHMENT_MEAN}
  | {type: EXPLORE_ACTION.SET_WILD_STATUS; wildStatus: WILD_STATUS}
  | {type: EXPLORE_ACTION.SET_REVIEWED; reviewedFilter: REVIEWED}
  | {type: EXPLORE_ACTION.SET_PHOTO_LICENSE; photoLicense: PHOTO_LICENSE}
  | {type: EXPLORE_ACTION.SET_MAP_BOUNDARIES; mapBoundaries: MapBoundaries}
  | {type: EXPLORE_ACTION.USE_STORED_STATE; storedState: State}
type Dispatch = ( action: Action ) => void

const ExploreContext = React.createContext<
  {
    state: State;
    dispatch: Dispatch;
    makeSnapshot(): void;
    differsFromSnapshot: boolean;
    isNotInitialState: boolean;
    discardChanges(): void;
    numberOfFilters: number;
    defaultExploreLocation(): Promise<DefaultLocation>;
      } | undefined>( undefined );

// Every key in this object represents a numbered filter in the UI
const calculatedFilters = {
  user_id: undefined,
  project_id: undefined,
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

// Sort by: is NOT a filter criteria, but should return to default state when reset is pressed
const defaultFilters = {
  ...calculatedFilters,
  created_d1: undefined,
  created_d2: undefined,
  created_on: undefined,
  d1: undefined,
  d2: undefined,
  iconic_taxa: undefined,
  months: undefined,
  observed_on: undefined,
  project: undefined,
  sortBy: SORT_BY.DATE_UPLOADED_NEWEST,
  user: undefined,
};

const initialState: State = {
  ...defaultFilters,
  // The very first time the user opens the explore screen, we want the place mode to be
  // nearby (even if we don't have location permission yet and not actually make any API request)
  placeMode: PLACE_MODE.NEARBY,
  place: undefined,
  // String to display as the human-readable place name, not to be used for default explore search
  // modes, like Nearby or Worldwide
  place_guess: "",
  place_id: undefined,
  return_bounds: undefined,
  taxon: undefined,
  taxon_id: undefined,
  verifiable: true,
};

// Checks if the date is in the format XXXX-XX-XX
function isValidDateFormat( date: string ): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test( date );
}

async function defaultExploreLocation( ): Promise<DefaultLocation> {
  const location = await fetchCoarseUserLocation( );
  if ( !location || !location.latitude ) {
    return {
      placeMode: PLACE_MODE.WORLDWIDE,
      lat: undefined,
      lng: undefined,
      radius: undefined,
      place_id: undefined,
      swlat: undefined,
      swlng: undefined,
      nelat: undefined,
      nelng: undefined,
    };
  }
  return {
    placeMode: PLACE_MODE.NEARBY,
    lat: location?.latitude,
    lng: location?.longitude,
    radius: 1,
    place_id: undefined,
    swlat: undefined,
    swlng: undefined,
    nelat: undefined,
    nelng: undefined,
  };
}

// Note: if an action needs to remove a value from state, do not `delete` it.
// Instead, set it to undefined. This helps us detect changes to the default
// state
function exploreReducer( state: State, action: Action ) {
  switch ( action.type ) {
    // Reset the state to the initial state, but place mode
    // should be set to worldwide no matter if location and not nearby
    case EXPLORE_ACTION.RESET:
      return {
        ...initialState,
        placeMode: PLACE_MODE.WORLDWIDE,
      };
    case EXPLORE_ACTION.DISCARD:
      return action.snapshot;
    case EXPLORE_ACTION.CHANGE_TAXON: {
      const newState = {
        ...state,
        ...action.storedState,
        iconic_taxa: undefined,
      };
      if ( action.taxon ) {
        newState.taxon = action.taxon;
        newState.taxon_id = action.taxon.id;
      } else {
        newState.taxon = null;
        newState.taxon_id = null;
      }
      return newState;
    }
    // Every iconic taxon filter is essentially a taxon filter... except
    // "unknown", which is a search for observations not associated with an
    // iconic taxon (either they have no taxon or their taxon is not a
    // descendant of an iconic taxon), so it needs its own special action.
    // We could also redo this so all iconic taxon filters remove the taxon
    // and add iconic_taxa.
    case EXPLORE_ACTION.FILTER_BY_ICONIC_TAXON_UNKNOWN: {
      const newState = {
        ...state,
        iconic_taxa: ["unknown"],
        taxon: undefined,
        taxon_id: undefined,
      };
      return newState;
    }
    case EXPLORE_ACTION.SET_EXPLORE_LOCATION:
      return {
        ...state,
        ...action.exploreLocation,
      };
    case EXPLORE_ACTION.SET_PLACE_MODE_NEARBY:
      return {
        ...state,
        placeMode: PLACE_MODE.NEARBY,

      };
    case EXPLORE_ACTION.SET_PLACE_MODE_WORLDWIDE:
      return {
        ...state,
        placeMode: PLACE_MODE.WORLDWIDE,
      };
    case EXPLORE_ACTION.SET_PLACE_MODE_MAP_AREA:
      return {
        ...state,
        placeMode: PLACE_MODE.MAP_AREA,
      };
    case EXPLORE_ACTION.SET_PLACE_MODE_PLACE:
      return {
        ...state,
        placeMode: PLACE_MODE.PLACE,
      };
    case EXPLORE_ACTION.SET_PLACE:
      return {
        ...state,
        ...action.storedState,
        lat: action.lat,
        lng: action.lng,
        nelat: undefined,
        nelng: undefined,
        place: action.place,
        place_guess: action.placeGuess,
        place_id: action.placeId,
        radius: action.radius,
        swlat: undefined,
        swlng: undefined,
      };
    case EXPLORE_ACTION.SET_USER:
      return {
        ...state,
        ...action.storedState,
        user: action.user,
        user_id: action.userId,
        excludeUser: null,
      };
    case EXPLORE_ACTION.EXCLUDE_USER:
      return {
        ...state,
        ...action.storedState,
        excludeUser: action.excludeUser,
        user: null,
        user_id: null,
      };
    case EXPLORE_ACTION.SET_PROJECT:
      return {
        ...state,
        ...action.storedState,
        project: action.project,
        project_id: action.projectId,
      };
    case EXPLORE_ACTION.CHANGE_SORT_BY:
      return {
        ...state,
        sortBy: action.sortBy,
      };
    case EXPLORE_ACTION.TOGGLE_RESEARCH_GRADE:
      return {
        ...state,
        researchGrade: !state.researchGrade,
      };
    case EXPLORE_ACTION.TOGGLE_NEEDS_ID:
      return {
        ...state,
        needsID: !state.needsID,
      };
    case EXPLORE_ACTION.TOGGLE_CASUAL:
      return {
        ...state,
        casual: !state.casual,
      };
    case EXPLORE_ACTION.SET_HIGHEST_TAXONOMIC_RANK:
      return {
        ...state,
        hrank: action.hrank === TAXONOMIC_RANK.none
          ? null
          : action.hrank,
      };
    case EXPLORE_ACTION.SET_LOWEST_TAXONOMIC_RANK:
      return {
        ...state,
        lrank: action.lrank === TAXONOMIC_RANK.none
          ? null
          : action.lrank,
      };
    case EXPLORE_ACTION.SET_DATE_OBSERVED_ALL:
      return {
        ...state,
        dateObserved: DATE_OBSERVED.ALL,
        observed_on: null,
        d1: null,
        d2: null,
        months: null,
      };
    case EXPLORE_ACTION.SET_DATE_OBSERVED_EXACT:
      if ( !isValidDateFormat( action.observedOn ) ) {
        throw new Error( "Invalid date format given" );
      }
      return {
        ...state,
        dateObserved: DATE_OBSERVED.EXACT_DATE,
        observed_on: action.observedOn,
        d1: null,
        d2: null,
        months: null,
      };
    case EXPLORE_ACTION.SET_DATE_OBSERVED_RANGE:
      if ( !isValidDateFormat( action.d1 ) ) {
        throw new Error( "Invalid date format given" );
      }
      if ( !isValidDateFormat( action.d2 ) ) {
        throw new Error( "Invalid date format given" );
      }
      return {
        ...state,
        dateObserved: DATE_OBSERVED.DATE_RANGE,
        observed_on: null,
        d1: action.d1,
        d2: action.d2,
        months: null,
      };
    case EXPLORE_ACTION.SET_DATE_OBSERVED_MONTHS:
      return {
        ...state,
        dateObserved: DATE_OBSERVED.MONTHS,
        observed_on: null,
        d1: null,
        d2: null,
        months: action.months,
      };
    case EXPLORE_ACTION.SET_DATE_UPLOADED_ALL:
      return {
        ...state,
        dateUploaded: DATE_UPLOADED.ALL,
        created_on: null,
        created_d1: null,
        created_d2: null,
      };
    case EXPLORE_ACTION.SET_DATE_UPLOADED_EXACT:
      if ( !isValidDateFormat( action.createdOn ) ) {
        throw new Error( "Invalid date format given" );
      }
      return {
        ...state,
        dateUploaded: DATE_UPLOADED.EXACT_DATE,
        created_on: action.createdOn,
        created_d1: null,
        created_d2: null,
      };
    case EXPLORE_ACTION.SET_DATE_UPLOADED_RANGE:
      if ( !isValidDateFormat( action.createdD1 ) ) {
        throw new Error( "Invalid date format given" );
      }
      if ( !isValidDateFormat( action.createdD2 ) ) {
        throw new Error( "Invalid date format given" );
      }
      return {
        ...state,
        dateUploaded: DATE_UPLOADED.DATE_RANGE,
        created_on: null,
        created_d1: action.createdD1,
        created_d2: action.createdD2,
      };
    case EXPLORE_ACTION.SET_MEDIA:
      return {
        ...state,
        media: action.media,
      };
    case EXPLORE_ACTION.SET_ESTABLISHMENT_MEAN:
      return {
        ...state,
        establishmentMean: action.establishmentMean,
      };
    case EXPLORE_ACTION.SET_WILD_STATUS:
      return {
        ...state,
        casual: action.wildStatus === WILD_STATUS.CAPTIVE
          ? true
          : state.casual,
        wildStatus: action.wildStatus,
      };
    case EXPLORE_ACTION.SET_PHOTO_LICENSE:
      return {
        ...state,
        photoLicense: action.photoLicense,
      };
    case EXPLORE_ACTION.SET_REVIEWED:
      return {
        ...state,
        reviewedFilter: action.reviewedFilter,
      };
    case EXPLORE_ACTION.SET_MAP_BOUNDARIES: {
      return {
        ...state,
        ...action.mapBoundaries,
        lat: undefined,
        lng: undefined,
        place_id: undefined,
        radius: undefined,
      };
    }
    case EXPLORE_ACTION.USE_STORED_STATE:
      return {
        ...action.storedState,
      };
    default: {
      throw new Error( `Unhandled action type: ${( action as Action ).type}` );
    }
  }
}

const ExploreProvider = ( { children }: ExploreProviderProps ) => {
  const [state, dispatch] = React.useReducer( exploreReducer, initialState );

  // To store a snapshot of the state, e.g when the user opens the filters modal
  const [snapshot, setSnapshot] = React.useState<State | undefined>( undefined );
  const makeSnapshot = () => setSnapshot( state );

  const differsFromSnapshot: boolean = React.useMemo(
    () => !isEqual( snapshot, state ),
    [state, snapshot],
  );

  const discardChanges = () => {
    if ( !snapshot ) {
      return;
    }
    dispatch( { type: EXPLORE_ACTION.DISCARD, snapshot } );
  };

  const isNotInitialState: boolean = Object.keys( initialState ).some(
    key => initialState[key] !== state[key],
  );

  let numberOfFilters: number = Object.keys( calculatedFilters ).reduce(
    ( count, key ) => {
      if ( state[key] !== calculatedFilters[key] ) {
        return count + 1;
      }
      return count;
    },
    0,
  );
  // If both low and high rank filters are set, we only count one filter
  if ( state.lrank && state.hrank ) {
    numberOfFilters -= 1;
  }

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value = {
    state,
    dispatch,
    defaultExploreLocation,
    isNotInitialState,
    numberOfFilters,
    makeSnapshot,
    differsFromSnapshot,
    discardChanges,
  };
  return (
    <ExploreContext.Provider value={value}>{children}</ExploreContext.Provider>
  );
};

function useExplore() {
  const context = React.useContext( ExploreContext );
  if ( context === undefined ) {
    throw new Error( "useExplore must be used within a ExploreProvider" );
  }
  return context;
}

export {
  ExploreProvider,
  exploreReducer,
  useExplore,
};
