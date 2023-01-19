import { fireEvent } from "@testing-library/react-native";
import ObsDetails from "components/ObsDetails/ObsDetails";
import React from "react";
// import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useIsConnected from "sharedHooks/useIsConnected";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

jest.useFakeTimers( );

const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30"
} );
const mockNoEvidenceObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30"
} );
mockNoEvidenceObservation.observationPhotos = [];
mockNoEvidenceObservation.observationSounds = [];
const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => mockUser
} ) );

jest.mock( "sharedHooks/useAuthenticatedQuery", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => ( {
    data: mockObservation
  } ) )
} ) );

// TODO if/when we test mutation behavior, the mutation will need to be mocked
// so it actually does something, or we need to take a different approach
jest.mock( "sharedHooks/useAuthenticatedMutation", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    mutate: ( ) => null
  } )
} ) );

jest.mock( "sharedHooks/useIsConnected" );

jest.mock( "components/ObsDetails/FlagItemModal" );

test( "renders obs details from remote call", async ( ) => {
  useIsConnected.mockImplementation( ( ) => true );
  const { getByTestId, getByText, findByTestId } = renderComponent( <ObsDetails /> );

  expect( await findByTestId( `ObsDetails.${mockObservation.uuid}` ) ).toBeTruthy( );
  expect(
    getByTestId( "PhotoScroll.photo" ).props.source
  ).toStrictEqual( { uri: mockObservation.observationPhotos[0].photo.url } );
  expect( getByText( mockObservation.taxon.name ) ).toBeTruthy( );
} );

describe( "flag functionality", ( ) => {
  test( "flag menu item only shows on id/comment", async ( ) => {
    const { findByTestId } = renderComponent( <ObsDetails /> );

    fireEvent.press( await findByTestId( "KebabMenu.Button" ) );
    fireEvent.press( await findByTestId( "MenuItem.Flag" ) );

    // test if modal visible and content on modal is on screen
  } );

  test( "opens flag modal on button press", async ( ) => {
    const { findByTestId } = renderComponent( <ObsDetails /> );

    fireEvent.press( await findByTestId( "KebabMenu.Button" ) );
    fireEvent.press( await findByTestId( "MenuItem.Flag" ) );

    // test if modal visible and content on modal is on screen
  } );

  test( "displays flagged content", async ( ) => {
    // not sure if possible since it requries an API call normally
    // probably to mock Remote/Local Flags ?
  } );
} );
