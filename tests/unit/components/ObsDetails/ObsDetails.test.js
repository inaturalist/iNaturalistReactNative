import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import factory from "../../../factory";
import ObsDetails from "../../../../src/components/ObsDetails/ObsDetails";

const observations = [factory( "RemoteObservation" )];

const mockedNavigate = jest.fn( );
const mockObservation = observations[0];
// TODO: learn how to mock a default export
jest.mock( "../../../../src/components/ObsDetails/hooks/useObservation", ( ) => ( {
  useObservation: ( ) => {
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

const renderObsDetails = ( ) => render(
  <NavigationContainer>
    <ObsDetails />
  </NavigationContainer>
);

test( "renders obs details from remote call", ( ) => {
  const { getByTestId, getByText } = renderObsDetails( );

  const obs = observations[0];

  expect( getByTestId( `ObsDetails.${obs.uuid}` ) ).toBeTruthy( );
  expect( getByTestId( "PhotoScroll.photo" ).props.source ).toStrictEqual( { "uri": obs.observationPhotos[0].photo.url } );
  expect( getByText( obs.taxon.preferred_common_name ) ).toBeTruthy( );
  expect( getByText( obs.place_guess ) ).toBeTruthy( );
} );


test( "renders data tab on button press", ( ) => {
  const { getByTestId, getByText } = renderObsDetails( );
  const button = getByTestId( "ObsDetails.DataTab" );

  const obs = observations[0];

  fireEvent.press( button );
  const time = obs.timeObservedAt;
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

  const obs = observations[0];

  fireEvent.press( getByTestId( `ObsDetails.identifier.${obs.identifications[0].user.id}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "UserProfile", {
    userId: obs.identifications[0].user.id
  } );
} );

test( "navigates to taxon details on button press", ( ) => {
  const { getByTestId } = renderObsDetails( );

  const obs = observations[0];

  fireEvent.press( getByTestId( `ObsDetails.taxon.${obs.taxon.id}` ) );
  expect( mockedNavigate ).toHaveBeenCalledWith( "TaxonDetails", {
    id: obs.taxon.id
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
