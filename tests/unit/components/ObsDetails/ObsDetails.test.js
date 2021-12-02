import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import ObsDetails from "../../../../src/components/ObsDetails/ObsDetails";

const testObservation = factory( "LocalObservation" );

const mockedNavigate = jest.fn( );
const mockExpected = testObservation;
// TODO: learn how to mock a default export
jest.mock( "../../../../src/components/ObsDetails/hooks/fetchObsFromRealm", ( ) => ( {
  useFetchObsDetailsFromRealm: ( ) => {
    return mockExpected;
  }
} ) );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        uuid: mockExpected.uuid
      }
    } ),
    useNavigation: ( ) => ( {
      navigate: mockedNavigate
    } )
  };
} );

const renderObsDetails = ( ) => render(
  <NavigationContainer>
    <ObsDetails />
  </NavigationContainer>
);

test( "renders obs details from local Realm", ( ) => {
  const { getByTestId, getByText } = renderObsDetails( );

  expect( getByTestId( `ObsDetails.${testObservation.uuid}` ) ).toBeTruthy( );
  expect( getByTestId( "PhotoScroll.photo" ).props.source ).toStrictEqual( { "uri": testObservation.observationPhotos[0].photo.url } );
  expect( getByText( testObservation.taxon.preferredCommonName ) ).toBeTruthy( );
  expect( getByText( testObservation.placeGuess ) ).toBeTruthy( );
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
