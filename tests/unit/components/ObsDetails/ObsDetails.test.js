import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import ObsDetails from "../../../../src/components/ObsDetails/ObsDetails";
import ObservationProvider from "../../../../src/providers/ObservationProvider";
import { ObservationContext } from "../../../../src/providers/contexts";

// Mock the hooks we use on ObsDetails since we're not trying to test them here
// jest.mock( "../../../../src/components/Observations/hooks/fetchObservations" );

jest.mock( "../../../../src/providers/ObservationProvider" );

const observations = [factory( "LocalObservation" )];
const testObservation = observations[0];

const mockedNavigate = jest.fn( );
const mockObservation = testObservation;
// TODO: learn how to mock a default export
jest.mock( "../../../../src/components/ObsDetails/hooks/fetchObsFromRealm", ( ) => ( {
  useFetchObsDetailsFromRealm: ( ) => {
    return mockObservation;
  }
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        uuid: mockObservation.uuid
      }
    } ),
    useNavigation: ( ) => ( {
      navigate: mockedNavigate
    } )
  };
} );

// Mock ObservationProvider so it provides a specific array of observations
// without any current observation or ability to update or fetch
// observations
const mockObservationProviderWithObservations = obs =>
  ObservationProvider.mockImplementation( ( { children }: Props ): Node => (
    <ObservationContext.Provider value={{
      exploreList: obs,
      setExploreList: ( ) => {}
    }}>
      {children}
    </ObservationContext.Provider>
  ) );

const renderObsDetails = ( ) => render(
  <NavigationContainer>
    <ObservationProvider>
      <ObsDetails />
    </ObservationProvider>
  </NavigationContainer>
);

test( "renders obs details from local Realm", ( ) => {
  // Mock the provided observations so we're just using our test data
  mockObservationProviderWithObservations( observations );
  const { getByTestId, getByText } = renderObsDetails( );

  const obs = observations[0];

  expect( getByTestId( `ObsDetails.${obs.uuid}` ) ).toBeTruthy( );
  expect( getByTestId( "PhotoScroll.photo" ).props.source ).toStrictEqual( { "uri": obs.observationPhotos[0].photo.url } );
  expect( getByText( obs.taxon.preferredCommonName ) ).toBeTruthy( );
  expect( getByText( obs.placeGuess ) ).toBeTruthy( );
} );


test( "renders data tab on button press", ( ) => {
  const { getByTestId, getByText } = renderObsDetails( );
  const button = getByTestId( "ObsDetails.DataTab" );

  fireEvent.press( button );
  const time = testObservation.timeObservedAt;
  // need regex here because the time observed is only a substring within <Text>
  const regex =  new RegExp( time );
  expect( getByText( regex ) ).toBeTruthy( );
} );

test( "navigates to observer profile on button press", ( ) => {
  const { getByTestId } = renderObsDetails( );

  fireEvent.press( getByTestId( "ObsDetails.currentUser" ) );
  // TODO: pass in correct data to make userId defined here and in component
  expect( mockedNavigate ).toHaveBeenCalledWith( "UserProfile", { userId: undefined } );
} );

test( "navigates to identifier profile on button press", ( ) => {
  const { getByTestId } = renderObsDetails( );

  fireEvent.press( getByTestId( `ObsDetails.identifier.${testObservation.identifications[0].user.id}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "UserProfile", {
    userId: testObservation.identifications[0].user.id
  } );
} );

test( "navigates to taxon details on button press", ( ) => {
  const { getByTestId } = renderObsDetails( );

  fireEvent.press( getByTestId( `ObsDetails.taxon.${testObservation.taxon.id}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "TaxonDetails", {
    id: testObservation.taxon.id
  } );
} );

test.todo( "should not have accessibility errors" );
// test( "should not have accessibility errors", ( ) => {
//   const obsDetails = (
//     <NavigationContainer>
//       <ObsDetails />
//     </NavigationContainer>
//   );
//   expect( obsDetails ).toBeAccessible( );
// } );
