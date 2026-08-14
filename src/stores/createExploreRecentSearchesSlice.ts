import type { ExploreV2Subject, Place } from "providers/ExploreV2Context";
import type { StateCreator } from "zustand";

export const RECENT_LIMIT = 10;

export const subjectKey = ( subject: ExploreV2Subject ): string => {
  switch ( subject.type ) {
    case "taxon":
      return `taxon-${subject.taxon.id}`;
    case "user":
      return `user-${subject.user.id}`;
    case "project":
      return `project-${subject.project.id}`;
    case "unobserved":
      return `unobserved-${subject.user.id}`;
    case "unknown":
      return "unknown";
    default: {
      // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
      const _exhaustive: never = subject;
      return _exhaustive;
    }
  }
};

export const placeKey = ( place: Place ): string => `place-${place.id}`;

// Newest first, unique by key, capped. Recording something already in the list
// bumps it to the front instead of duplicating it.
export const addRecent = <T>(
  items: T[],
  item: T,
  keyFn: ( _item: T ) => string,
  cap: number = RECENT_LIMIT,
): T[] => [
    item,
    ...items.filter( existing => keyFn( existing ) !== keyFn( item ) ),
  ].slice( 0, cap );

export interface ExploreRecentSearchesSlice {
  exploreRecentSearches: {
    subjects: ExploreV2Subject[];
    places: Place[];
    recordSubject: ( _subject: ExploreV2Subject ) => void;
    recordPlace: ( _place: Place ) => void;
    clearRecents: ( ) => void;
  };
}

// Recent Explore searches, shown in the default state of the Universal Search
// fields. These hold search *ingredients*, not whole searches: a recent subject
// sets the subject and nothing else, a recent place fills the location field.
const createExploreRecentSearchesSlice: StateCreator<ExploreRecentSearchesSlice> = set => ( {
  exploreRecentSearches: {
    subjects: [],
    places: [],
    recordSubject: subject => set( state => ( {
      exploreRecentSearches: {
        ...state.exploreRecentSearches,
        subjects: addRecent(
          state.exploreRecentSearches.subjects,
          subject,
          subjectKey,
        ),
      },
    } ) ),
    recordPlace: place => set( state => ( {
      exploreRecentSearches: {
        ...state.exploreRecentSearches,
        places: addRecent(
          state.exploreRecentSearches.places,
          place,
          placeKey,
        ),
      },
    } ) ),
    clearRecents: ( ) => set( state => ( {
      exploreRecentSearches: {
        ...state.exploreRecentSearches,
        subjects: [],
        places: [],
      },
    } ) ),
  },
} );

export default createExploreRecentSearchesSlice;
