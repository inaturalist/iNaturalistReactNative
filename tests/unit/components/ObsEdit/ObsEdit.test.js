import { screen, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent, wrapInNavigationContainer } from "tests/helpers/render";

// Note: HeaderBackButton has accessibility issues
jest.mock( "@react-navigation/elements" );

jest.mock( "sharedHooks/useWatchPosition", () => ( {
  __esModule: true,
  default: ( ) => ( {
    hasLocation: true,
    isFetchingLocation: false
  } )
} ) );

const mockUser = factory( "LocalUser" );

const mockMutate = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", () => ( {
  __esModule: true,
  default: () => ( {
    mutate: mockMutate
  } )
} ) );

const observationPhotos = [
  factory( "RemoteObservationPhoto", {
    position: 0
  } )
];

const mockObservation = factory( "LocalObservation", {
  observationPhotos,
  time_observed_at: null,
  user: mockUser
} );

describe( "ObsEdit", () => {
  beforeEach( ( ) => {
    useStore.setState( {
      currentObservation: mockObservation,
      observations: [mockObservation]
    } );
  } );

  it( "should not have accessibility errors", async ( ) => {
    const view = wrapInNavigationContainer( <ObsEdit /> );
    expect( view ).toBeAccessible();
  } );

  it( "displays the number of photos in global state obsPhotos", async ( ) => {
    renderComponent( <ObsEdit /> );

    const evidenceList = screen.getByTestId( "EvidenceList.DraggableFlatList" );

    await waitFor( ( ) => {
      expect( evidenceList ).toHaveProp( "data", observationPhotos[0].uri );
    } );
  } );
} );
