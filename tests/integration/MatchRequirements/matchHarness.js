import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import NetInfo from "@react-native-community/netinfo";
import {
  createNavigationContainerRef,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react-native";
import MatchContainer from "components/Match/MatchContainer";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";
import { Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// As StartupService does: React Query pauses requests while NetInfo says offline
onlineManager.setEventListener( setOnline => NetInfo.addEventListener( state => {
  setOnline( !!state.isConnected );
} ) );

// Each implementation of the Match screen under test. V2 adds an entry with
// its own component and reader once it exists.
export const IMPLEMENTATIONS = {
  v1: {
    Component: MatchContainer,
    read: candidates => readV1( candidates ),
    // Actions a person takes, expressed per implementation
    pressSave: actor => actor.press( screen.getByTestId( "MatchScreen.saveButton" ) ),
    pressDiscard: actor => actor.press( screen.getByTestId( "MatchScreen.discardButton" ) ),
    chooseAlternative: ( actor, taxon ) => actor.press(
      screen.getAllByTestId( `SuggestionsResult.${taxon.id}` ).at( -1 ),
    ),
    chooseGroup: ( actor, iconicTaxon ) => actor.press(
      screen.getByTestId( `IconicSuggestion.${iconicTaxon.id}` ),
    ),
    pressAddLocation: actor => actor.press(
      screen.getAllByText( "ADD LOCATION FOR BETTER IDS" ).at( 0 ),
    ),
    pressLearnMore: actor => actor.press( screen.getByText( /LEARN MORE ABOUT THIS/ ) ),
    pressEdit: actor => actor.press( screen.getByTestId( "ObsEditIcon" ) ),
    pressObservationPhoto: actor => actor.press( screen.getByTestId( "MatchScreen.ObsPhoto" ) ),
  },
};

export const SCREEN_UNDER_TEST = process.env.MATCH_IMPL || "v1";

const VERDICTS = [
  "You observed this species",
  "You observed a species in this group",
  "You likely observed this species",
  "You likely observed a species in this group",
  "You may have observed this species",
  "You may have observed a species in this group",
  "The AI is not confident. It may be one of the IDs below.",
  "The AI is not confident. Upload to ask the community.",
];

const collectTexts = el => el.children.flatMap( child => (
  typeof child === "string"
    ? [child]
    : collectTexts( child )
) );

// V1 has no test IDs on the match card, so start from the confidence
// percentage and widen until the card's taxon name is in view. Scientific
// names render in pieces ("Silphium " + "laciniatum"), so compare joined text
// and prefer the longest name to tell a species from its genus.
function readTopV1( candidates ) {
  const confidenceEl = screen.queryByText( /^\d+(\.\d+)?%$/ );
  if ( !confidenceEl ) return null;
  let node = confidenceEl;
  for ( let i = 0; i < 8 && node.parent; i += 1 ) {
    node = node.parent;
    const texts = collectTexts( node );
    const joined = texts.join( "" );
    const matches = candidates.filter( taxon => (
      texts.includes( taxon.preferred_common_name ) || joined.includes( taxon.name )
    ) );
    if ( matches.length > 0 ) {
      const best = [...matches].sort( ( a, b ) => b.name.length - a.name.length )[0];
      return {
        id: best.id,
        confidence: Number( confidenceEl.props.children.toString( ).replace( /[^\d.]/g, "" ) ),
        showsCommonName: texts.includes( best.preferred_common_name ),
      };
    }
  }
  return null;
}

// What a person can see on V1 Match, reduced to plain values so scenarios can
// compare it with what V2 shows
function readV1( candidates ) {
  const altIds = [];
  screen.queryAllByTestId( /^SuggestionsResult\.\d+$/ ).forEach( el => {
    const id = Number( el.props.testID.split( "." )[1] );
    if ( !altIds.includes( id ) ) altIds.push( id );
  } );
  let learnMore = null;
  if ( screen.queryByText( "LEARN MORE ABOUT THIS SPECIES" ) ) learnMore = "species";
  if ( screen.queryByText( "LEARN MORE ABOUT THIS GROUP" ) ) learnMore = "group";
  let alternativesHeading = null;
  if ( screen.queryByText( "It might also be" ) ) alternativesHeading = "It might also be";
  if ( screen.queryByText( "It might be one of these" ) ) {
    alternativesHeading = "It might be one of these";
  }
  return {
    crashed: !!screen.queryByTestId( "Harness.crashed" ),
    analyzing: !!screen.queryByText( "Analyzing for the best identification..." ),
    verdict: VERDICTS.find( v => screen.queryByText( v ) ) || null,
    top: readTopV1( candidates ),
    alternativesHeading,
    alternatives: altIds,
    groupPicker: !!screen.queryByText( "Do you know what group this is in?" ),
    addLocationButton: screen.queryAllByText( "ADD LOCATION FOR BETTER IDS" ).length > 0,
    learnMore,
    locationPermissionPrompt: !!screen.queryByText( "Improve suggestions by using your location" ),
    addLocationBusy: screen.queryAllByLabelText( "Edit location" ).some( el => (
      !!( el.props.accessibilityState?.disabled || el.props.disabled )
    ) ),
    map: !!screen.queryByTestId( "MapSection" ),
    photoCount: screen.queryByTestId( "photo-count" )
      ? Number( collectTexts( screen.getByTestId( "photo-count" ) ).join( "" ) )
      : null,
    mediaViewerOpen: !!screen.queryByTestId( "MediaViewer" ),
  };
}

const Stack = createNativeStackNavigator( );

// Every place Match can send someone, so a scenario can check where it ended
// up without rendering those screens
const DESTINATIONS = [
  "Camera",
  "TaxonDetails",
  "ObsEdit",
  "LocationPicker",
  "TabNavigator",
  "MatchTaxonSearchScreen",
];
const Destination = ( { route } ) => (
  <Text testID={`Destination.${route.name}`}>{route.name}</Text>
);

// Main has no error boundary around screens, so a render error here would
// take down the whole app. Catch it so a scenario can record that it happened.
class CrashBoundary extends React.Component {
  constructor( props ) {
    super( props );
    this.state = { error: null };
  }

  static getDerivedStateFromError( error ) {
    return { error };
  }

  render( ) {
    const { error } = this.state;
    const { children } = this.props;
    if ( error ) return <Text testID="Harness.crashed">{error.message}</Text>;
    return children;
  }
}

const SCREENS = Object.fromEntries( Object.entries( IMPLEMENTATIONS ).map(
  ( [key, { Component }] ) => [key, ( ) => (
    <CrashBoundary>
      <Component />
    </CrashBoundary>
  )],
) );

// `from` puts a screen under Match, as when arriving from the camera.
// `screens` swaps a destination stub for a real screen, or adds a screen
// Match itself never goes to, so a scenario can follow a longer journey.
export const renderMatch = ( { from, screens = {} } = {} ) => {
  const navigationRef = createNavigationContainerRef( );
  // A fresh client per render so a cached CV response from another scenario
  // can't leak in
  const queryClient = new QueryClient( {
    defaultOptions: { queries: { gcTime: Infinity } },
  } );
  const Component = SCREENS[SCREEN_UNDER_TEST];
  render(
    <QueryClientProvider client={queryClient}>
      <INatPaperProvider>
        <GestureHandlerRootView className="flex-1">
          <BottomSheetModalProvider>
            <NavigationContainer
              ref={navigationRef}
              initialState={from
                ? { index: 1, routes: [{ name: from }, { name: "Match" }] }
                : undefined}
              theme={{
                ...DefaultTheme,
                fonts: { regular: { fontFamily: "System", fontWeight: "normal" } },
              }}
            >
              <Stack.Navigator>
                <Stack.Screen name="Match" component={Component} />
                {DESTINATIONS.map( name => (
                  <Stack.Screen
                    key={name}
                    name={name}
                    component={screens[name] || Destination}
                  />
                ) )}
                {Object.keys( screens )
                  .filter( name => !DESTINATIONS.includes( name ) )
                  .map( name => (
                    <Stack.Screen key={name} name={name} component={screens[name]} />
                  ) )}
              </Stack.Navigator>
            </NavigationContainer>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </INatPaperProvider>
    </QueryClientProvider>,
  );
  const impl = IMPLEMENTATIONS[SCREEN_UNDER_TEST];
  return {
    impl,
    currentRoute: ( ) => navigationRef.getCurrentRoute( ),
    // Names of the screens in the stack, bottom first
    stack: ( ) => navigationRef.getRootState( )?.routes.map( route => route.name ),
    goBack: ( ) => act( ( ) => navigationRef.goBack( ) ),
  };
};
