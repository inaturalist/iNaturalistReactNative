// https://github.com/inaturalist/iNaturalistReactNative/pull/3257#issue-3683778984
// With the exception of the enum TopSuggestionType, these are namespaced w/ `UseSuggestions`
// this is annoyingly verbose, but the intent is to obviously separate them from ad hoc
// types defined by the various consumers. Eventually, once the ts migration is further along
// we can define remove those adhoc types and remove the namespace here and/or globalize them

export enum TopSuggestionType {
 TOP_SUGGESTION_NONE = "none",
 TOP_SUGGESTION_HUMAN = "human",
 TOP_SUGGESTION_ABOVE_THRESHOLD = "above-threshold",
 TOP_SUGGESTION_COMMON_ANCESTOR = "common-ancestor",
 TOP_SUGGESTION_NOT_CONFIDENT = "not-confident",
}

export interface UseSuggestionsOnlineSuggestion {
  score: number;
  combined_score: number;
  taxon: {
    id: number;
    name: string;
  };
}

export interface UseSuggestionsOfflineSuggestion {
  combined_score: number;
  taxon: {
    id: number;
    name: string;
    rank_level: number;
    iconic_taxon_name?: string;
  };
}

export type UseSuggestionsSuggestion =
    UseSuggestionsOnlineSuggestion | UseSuggestionsOfflineSuggestion;

export interface UseSuggestionsResult {
  suggestions: {
    otherSuggestions: UseSuggestionsSuggestion[];
    topSuggestion: UseSuggestionsSuggestion | undefined;
    topSuggestionType: TopSuggestionType;
  };
  usingOfflineSuggestions: boolean;
  urlWillCrashOffline: boolean;
  refetchSuggestions: () => void;
  onlineSuggestionsUpdatedAt: number;
  onlineSuggestionsError: Error | null;
  onlineSuggestions?: {
    results: UseSuggestionsOnlineSuggestion[];
    commonAncestor?: UseSuggestionsOnlineSuggestion;
  };
  timedOut: boolean;
  resetTimeout: () => void;
}

type MaybeLatLng = { lat: number; lng: number } | { lat: undefined; lng: undefined };

export type ScoreImageParams = MaybeLatLng & {
  image?: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface UseSuggestionsOptions {
  shouldFetchOnlineSuggestions: boolean;
  onFetchError: ( options: { isOnline: boolean } ) => void;
  onFetched: ( options: { isOnline: boolean } ) => void;
  scoreImageParams?: ScoreImageParams;
  queryKey: string[];
  onlineSuggestionsAttempted: boolean;
}
