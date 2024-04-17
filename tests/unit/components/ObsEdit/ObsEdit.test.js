import { screen, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const initialStoreState = useStore.getState( );

jest.mock( "sharedHooks/useCurrentObservationLocation", () => ( {
  __esModule: true,
  default: ( ) => ( {
    hasLocation: true,
    isFetchingLocation: false,
    permissionResult: "granted"
  } )
} ) );

jest.mock( "components/ObsEdit/BottomButtons" );
jest.mock( "components/SharedComponents/IconicTaxonChooser" );
jest.mock( "components/ObsEdit/Sheets/AddEvidenceSheet" );

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
  time_observed_at: null
} );

beforeAll( async ( ) => {
  useStore.setState( initialStoreState, true );
  useStore.setState( {
    currentObservation: mockObservation,
    observations: [mockObservation]
  } );
} );

describe( "ObsEdit", () => {
  it( "should not have accessibility errors", async ( ) => {
    const obsEdit = <ObsEdit />;
    expect( obsEdit ).toBeAccessible();
  } );

  it( "displays the number of photos in global state obsPhotos", async ( ) => {
    renderComponent( <ObsEdit /> );

    const evidenceList = screen.getByTestId( "EvidenceList.DraggableFlatList" );

    await waitFor( ( ) => {
      expect( evidenceList ).toHaveProp( "data", observationPhotos );
    } );
  } );
} );
