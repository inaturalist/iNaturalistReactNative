import type { ApiProjectSummary, ApiUser } from "api/types";
import type {
  ESTABLISHMENT_MEAN,
  MEDIA,
  PHOTO_LICENSE,
  REVIEWED,
} from "providers/ExploreContext";
import {
  DATE_OBSERVED,
  DATE_UPLOADED,
  TAXONOMIC_RANK,
  WILD_STATUS,
} from "providers/ExploreContext";
import type {
  ExploreV2Filters,
  ExploreV2LocationState,
  ExploreV2State,
  ExploreV2Subject,
} from "providers/ExploreV2Context";
import {
  defaultExploreV2Filters,
  EXPLORE_V2_PLACE_MODE,
} from "providers/ExploreV2Context";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";

// Advanced search only keeps a taxon or "unknown" as a subject
export type AdvancedSearchSubject = Extract<
  ExploreV2Subject,
  { type: "taxon" | "unknown" }
>;

// The draft is a subset of ExploreV2State
export interface AdvancedSearchDraft {
  subject: AdvancedSearchSubject | null;
  location: ExploreV2LocationState;
  sortBy: OBSERVATIONS_SORT;
  filters: ExploreV2Filters;
}

// Only taxon goes in the subject. user/project live in the filter blob
export const draftFromV2State = ( v2: ExploreV2State ): AdvancedSearchDraft => {
  const { subject } = v2;
  const base = { location: v2.location, sortBy: v2.sortBy };
  switch ( subject?.type ) {
    case "user":
      return { ...base, subject: null, filters: { ...v2.filters, user: subject.user } };
    case "project":
      return { ...base, subject: null, filters: { ...v2.filters, project: subject.project } };
    case "unobserved":
      return { ...base, subject: null, filters: v2.filters };
    default:
      return { ...base, subject: subject ?? null, filters: v2.filters };
  }
};

export const defaultAdvancedSearchDraft: AdvancedSearchDraft = {
  subject: null,
  location: { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE },
  sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
  filters: defaultExploreV2Filters,
};

export type SubjectTaxon = Extract<ExploreV2Subject, { type: "taxon" }>["taxon"];

export type AdvancedSearchAction =
  | { type: "SET_TAXON"; taxon: SubjectTaxon | null }
  | { type: "FILTER_BY_ICONIC_UNKNOWN" }
  | { type: "SET_LOCATION_PLACE"; place: { id: number; display_name?: string } }
  | { type: "SET_LOCATION_NEARBY" }
  | { type: "SET_LOCATION_WORLDWIDE" }
  | { type: "SET_SORT"; sortBy: OBSERVATIONS_SORT }
  | { type: "SET_USER"; user: ApiUser | null }
  | { type: "SET_EXCLUDE_USER"; user: ApiUser | null }
  | { type: "SET_PROJECT"; project: ApiProjectSummary | null }
  | { type: "TOGGLE_RESEARCH_GRADE" }
  | { type: "TOGGLE_NEEDS_ID" }
  | { type: "TOGGLE_CASUAL" }
  | { type: "SET_HRANK"; hrank: TAXONOMIC_RANK }
  | { type: "SET_LRANK"; lrank: TAXONOMIC_RANK }
  | { type: "SET_DATE_OBSERVED_ALL" }
  | { type: "SET_DATE_OBSERVED_EXACT"; observedOn: string }
  | { type: "SET_DATE_OBSERVED_RANGE"; d1: string; d2: string }
  | { type: "SET_DATE_OBSERVED_MONTHS"; months: number[] }
  | { type: "SET_DATE_UPLOADED_ALL" }
  | { type: "SET_DATE_UPLOADED_EXACT"; createdOn: string }
  | { type: "SET_DATE_UPLOADED_RANGE"; createdD1: string; createdD2: string }
  | { type: "SET_MEDIA"; media: MEDIA }
  | { type: "SET_ESTABLISHMENT_MEAN"; establishmentMean: ESTABLISHMENT_MEAN }
  | { type: "SET_WILD_STATUS"; wildStatus: WILD_STATUS }
  | { type: "SET_REVIEWED"; reviewedFilter: REVIEWED }
  | { type: "SET_PHOTO_LICENSE"; photoLicense: PHOTO_LICENSE }
  | { type: "RESET" };

const withFilters = (
  draft: AdvancedSearchDraft,
  patch: Partial<ExploreV2Filters>,
): AdvancedSearchDraft => ( {
  ...draft,
  filters: { ...draft.filters, ...patch },
} );

export const advancedSearchReducer = (
  draft: AdvancedSearchDraft,
  action: AdvancedSearchAction,
): AdvancedSearchDraft => {
  switch ( action.type ) {
    case "SET_TAXON":
      return {
        ...draft,
        subject: action.taxon
          ? { type: "taxon", taxon: action.taxon }
          : null,
      };
    case "FILTER_BY_ICONIC_UNKNOWN":
      // special case -- not a taxon
      return { ...draft, subject: { type: "unknown" } };
    case "SET_LOCATION_PLACE":
      return {
        ...draft,
        location: { placeMode: EXPLORE_V2_PLACE_MODE.PLACE, place: action.place },
      };
    case "SET_LOCATION_NEARBY":
      return {
        ...draft,
        location: { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY },
      };
    case "SET_LOCATION_WORLDWIDE":
      return {
        ...draft,
        location: { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE },
      };
    case "SET_SORT":
      return { ...draft, sortBy: action.sortBy };
    case "SET_USER":
      return withFilters( draft, { user: action.user, excludeUser: null } );
    case "SET_EXCLUDE_USER":
      return withFilters( draft, { excludeUser: action.user, user: null } );
    case "SET_PROJECT":
      return withFilters( draft, { project: action.project } );
    case "TOGGLE_RESEARCH_GRADE":
      return withFilters( draft, { researchGrade: !draft.filters.researchGrade } );
    case "TOGGLE_NEEDS_ID":
      return withFilters( draft, { needsID: !draft.filters.needsID } );
    case "TOGGLE_CASUAL":
      return withFilters( draft, { casual: !draft.filters.casual } );
    case "SET_HRANK":
      return withFilters( draft, {
        hrank: action.hrank === TAXONOMIC_RANK.none
          ? null
          : action.hrank,
      } );
    case "SET_LRANK":
      return withFilters( draft, {
        lrank: action.lrank === TAXONOMIC_RANK.none
          ? null
          : action.lrank,
      } );
    case "SET_DATE_OBSERVED_ALL":
      return withFilters( draft, {
        dateObserved: DATE_OBSERVED.ALL,
        observed_on: null,
        d1: null,
        d2: null,
        months: null,
      } );
    case "SET_DATE_OBSERVED_EXACT":
      return withFilters( draft, {
        dateObserved: DATE_OBSERVED.EXACT_DATE,
        observed_on: action.observedOn,
        d1: null,
        d2: null,
        months: null,
      } );
    case "SET_DATE_OBSERVED_RANGE":
      return withFilters( draft, {
        dateObserved: DATE_OBSERVED.DATE_RANGE,
        observed_on: null,
        d1: action.d1,
        d2: action.d2,
        months: null,
      } );
    case "SET_DATE_OBSERVED_MONTHS":
      return withFilters( draft, {
        dateObserved: DATE_OBSERVED.MONTHS,
        observed_on: null,
        d1: null,
        d2: null,
        months: action.months,
      } );
    case "SET_DATE_UPLOADED_ALL":
      return withFilters( draft, {
        dateUploaded: DATE_UPLOADED.ALL,
        created_on: null,
        created_d1: null,
        created_d2: null,
      } );
    case "SET_DATE_UPLOADED_EXACT":
      return withFilters( draft, {
        dateUploaded: DATE_UPLOADED.EXACT_DATE,
        created_on: action.createdOn,
        created_d1: null,
        created_d2: null,
      } );
    case "SET_DATE_UPLOADED_RANGE":
      return withFilters( draft, {
        dateUploaded: DATE_UPLOADED.DATE_RANGE,
        created_on: null,
        created_d1: action.createdD1,
        created_d2: action.createdD2,
      } );
    case "SET_MEDIA":
      return withFilters( draft, { media: action.media } );
    case "SET_ESTABLISHMENT_MEAN":
      return withFilters( draft, { establishmentMean: action.establishmentMean } );
    case "SET_WILD_STATUS":
      return withFilters( draft, {
        wildStatus: action.wildStatus,
        casual: action.wildStatus === WILD_STATUS.CAPTIVE
          ? true
          : draft.filters.casual,
      } );
    case "SET_REVIEWED":
      return withFilters( draft, { reviewedFilter: action.reviewedFilter } );
    case "SET_PHOTO_LICENSE":
      return withFilters( draft, { photoLicense: action.photoLicense } );
    case "RESET":
      return defaultAdvancedSearchDraft;
    default: {
      // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
};
