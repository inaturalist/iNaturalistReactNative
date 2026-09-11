import {
  act,
  fireEvent,
  screen,
  userEvent,
  within,
} from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import useStore from "stores/useStore";

const actor = userEvent.setup( );

/** Turns on ExploreV2 and clears the search state that persists between tests. */
export const resetExploreV2 = ( ) => act( ( ) => {
  useStore.setState( state => ( {
    featureFlagConfig: {
      ...state.featureFlagConfig,
      exploreV2Enabled: true,
    },
  } ) );
  const {
    exploreRecentSearches,
    exploreSavedSearches,
    exploreV2AdvancedSearch,
  } = useStore.getState( );
  exploreRecentSearches.clearRecents( );
  exploreSavedSearches.clearSavedSearches( );
  exploreV2AdvancedSearch.setAdvancedSearchMode( false );
} );

export async function navigateToExplore( ) {
  const tabBar = await screen.findByTestId( "CustomTabBar" );
  await actor.press( await within( tabBar ).findByText( "Explore" ) );
  await screen.findByTestId( "ExploreResults" );
}

export async function openUniversalSearch( ) {
  const header = await screen.findByTestId( "ExploreV2Header" );
  await actor.press( within( header ).getByTestId( "ExploreV2Header.searchButton" ) );
  await screen.findByTestId( "UniversalSearch" );
}

/** Types into a Universal Search field and lets the debounced autocomplete run.
 * Needs fake timers. */
export function typeIntoSearchField( testID, text ) {
  const input = screen.getByTestId( testID );
  // The result list follows the focused field, and only the subject field autofocuses
  fireEvent( input, "focus" );
  fireEvent.changeText( input, text );
  act( ( ) => {
    jest.advanceTimersByTime( 400 );
  } );
}

export async function submitUniversalSearch( ) {
  await actor.press( screen.getByTestId( "UniversalSearch.searchButton" ) );
  await screen.findByTestId( "ExploreResults" );
}

/** Picks a taxon from the subject autocomplete and searches for it. */
export async function searchForTaxon( taxon ) {
  typeIntoSearchField( "UniversalSearch.subjectInput", taxon.name );
  await actor.press( await screen.findByTestId( `UniversalSearchResult.taxon.${taxon.id}` ) );
  await submitUniversalSearch( );
}

/** The params of the most recent observations search, i.e. what the user's choices produced. */
export function lastObservationsSearchParams( ) {
  const { calls } = inatjs.observations.search.mock;
  return calls[calls.length - 1]?.[0];
}
