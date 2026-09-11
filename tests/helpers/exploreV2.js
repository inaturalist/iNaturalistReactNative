import {
  act,
  screen,
  userEvent,
  within,
} from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import useStore from "stores/useStore";

const actor = userEvent.setup( );

/** Turns on ExploreV2. Search state needs no clearing here: jest.post-setup resets every
 * store after each test. */
export const enableExploreV2 = ( ) => act( ( ) => {
  useStore.setState( state => ( {
    featureFlagConfig: {
      ...state.featureFlagConfig,
      exploreV2Enabled: true,
    },
  } ) );
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
 * Needs fake timers. The result list follows the focused field and only the subject field
 * autofocuses, so skipBlur keeps this field focused after typing. */
export async function typeIntoSearchField( testID, text ) {
  await actor.type( screen.getByTestId( testID ), text, { skipBlur: true } );
  act( ( ) => {
    jest.advanceTimersByTime( 400 );
  } );
}

/** Focuses a Universal Search field without typing. userEvent has no focus action and its
 * press( ) does not emit focus, so type an empty string. */
export async function focusSearchField( testID ) {
  await typeIntoSearchField( testID, "" );
}

export async function submitUniversalSearch( ) {
  await actor.press( screen.getByTestId( "UniversalSearch.searchButton" ) );
  await screen.findByTestId( "ExploreResults" );
}

/** Picks a taxon from the subject autocomplete and searches for it. */
export async function searchForTaxon( taxon ) {
  await typeIntoSearchField( "UniversalSearch.subjectInput", taxon.name );
  await actor.press( await screen.findByTestId( `UniversalSearchResult.taxon.${taxon.id}` ) );
  await submitUniversalSearch( );
}

/** The params of the most recent observations search, i.e. what the user's choices produced. */
export function lastObservationsSearchParams( ) {
  const { calls } = inatjs.observations.search.mock;
  return calls[calls.length - 1]?.[0];
}
