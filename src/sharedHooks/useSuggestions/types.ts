export interface UseSuggestionsOnlineSuggestion {
  score: number;
  combined_score: number;
  taxon: {
    id: number;
    name: string;
  }
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

export type TopSuggestionType = string;

export type UseSuggestionsSuggestion =
    UseSuggestionsOnlineSuggestion | UseSuggestionsOfflineSuggestion;

export interface UseSuggestionsResult {
  suggestions: {
  otherSuggestions: UseSuggestionsSuggestion[];
        topSuggestion: UseSuggestionsSuggestion | null;
        topSuggestionType: string;
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

export interface ScoreImageParams {
  lat: number;
  lng: number;
  image: {
    uri: string,
    name: string,
    type: string
  }
}
