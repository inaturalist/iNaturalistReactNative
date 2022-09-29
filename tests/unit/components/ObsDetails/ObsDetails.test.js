import { NavigationContainer } from "@react-navigation/native";
import { fireEvent, render } from "@testing-library/react-native";
import ObsDetails from "components/ObsDetails/ObsDetails";
import React from "react";

import { ObsEditContext } from "../../../../src/providers/contexts";
import ObsEditProvider from "../../../../src/providers/ObsEditProvider";
import factory from "../../../factory";

const mockedNavigate = jest.fn( );
const mockObservation = factory( "LocalObservation" );

jest.mock( "../../../../src/providers/ObsEditProvider" );

jest.mock(
  "../../../../src/components/ObsDetails/hooks/useRemoteObservation",
  ( ) => ( {
    __esModule: true,
    default: ( _observation, _refetch ) => ( {
      remoteObservation: mockObservation,
      currentUserFaved: false
    } )
  } )
);

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
      navigate: mockedNavigate,
      addListener: jest.fn( )
    } )
  };
} );

jest.mock( "../../../../src/components/LoginSignUp/AuthenticationService", ( ) => ( {
  getUserId: ( ) => mockObservation.user.id
} ) );

const mockObsEditProviderWithObs = ( ) => ObsEditProvider.mockImplementation( ( { children } ) => (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  <ObsEditContext.Provider value={{
    addObservations: ( ) => { }
  }}
  >
    {children}
  </ObsEditContext.Provider>
) );

const renderObsDetails = ( ) => render(
  <NavigationContainer>
    <ObsEditProvider>
      <ObsDetails />
    </ObsEditProvider>
  </NavigationContainer>
);

test( "renders obs details from remote call", ( ) => {
  mockObsEditProviderWithObs( );

  const { getByTestId, getByText } = renderObsDetails( );

  expect( getByTestId( `ObsDetails.${mockObservation.uuid}` ) ).toBeTruthy( );
  expect(
    getByTestId( "PhotoScroll.photo" ).props.source
  ).toStrictEqual( { uri: mockObservation.observationPhotos[0].photo.url } );
  expect( getByText( mockObservation.taxon.name ) ).toBeTruthy( );
  // TODO: figure out how to test elements which are mapped to camelCase via Observation model
  // right now, these elements are not rendering in renderObsDetails( ).debug( ) at all
} );

test( "renders data tab on button press", ( ) => {
  const { getByTestId, getByText } = renderObsDetails( );
  const button = getByTestId( "ObsDetails.DataTab" );

  fireEvent.press( button );
  expect( getByText( mockObservation.description ) ).toBeTruthy( );
} );

test( "navigates to observer profile on button press", ( ) => {
  const { getByTestId } = renderObsDetails( );

  fireEvent.press( getByTestId( "ObsDetails.currentUser" ) );
  expect( mockedNavigate )
    .toHaveBeenCalledWith( "UserProfile", { userId: mockObservation.user.id } );
} );

test( "navigates to identifier profile on button press", ( ) => {
  const { getByTestId } = renderObsDetails( );

  fireEvent.press(
    getByTestId( `ObsDetails.identifier.${mockObservation.identifications[0].user.id}` )
  );
  expect( mockedNavigate ).toHaveBeenCalledWith( "UserProfile", {
    userId: mockObservation.identifications[0].user.id
  } );
} );

test( "navigates to taxon details on button press", ( ) => {
  const { getByTestId } = renderObsDetails( );

  fireEvent.press( getByTestId( `ObsDetails.taxon.${mockObservation.taxon.id}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "TaxonDetails", {
    id: mockObservation.taxon.id
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
