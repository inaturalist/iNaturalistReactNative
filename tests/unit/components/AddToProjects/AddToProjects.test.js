import { screen } from "@testing-library/react-native";
import AddToProjects from "components/AddToProjects/AddToProjects";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockProjects = [
  factory( "LocalProject" ),
  factory( "LocalProject" ),
];

jest.mock( "providers/contexts", () => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: () => global.realm,
      useQuery: ( ) => mockProjects,
    },
  };
} );

const initialStoreState = useStore.getState( );

function renderAddToProjects( ) {
  return renderComponent(
    <AddToProjects />,
  );
}

beforeEach( ( ) => {
  jest.clearAllMocks( );
  useStore.setState( initialStoreState, true );
  useStore.setState( {
    currentObservation: {
      ...factory( "LocalObservation" ),
      projectObservations: [factory( "LocalProjectObservation", {
        projectId: mockProjects[0].id,
      } )],
    },
  } );
} );

describe( "AddToProjects", ( ) => {
  it( "renders section headers and collection/umbrella explainer", ( ) => {
    renderAddToProjects( );
    expect( screen.getByText( "Traditional Projects" ) ).toBeVisible( );
    expect( screen.getByText(
      "You can manually add observations to Traditional Projects you have joined.",
    ) ).toBeVisible( );
    expect( screen.getByText( "Collection & Umbrella Projects" ) ).toBeVisible( );
    expect( screen.getByText(
      // eslint-disable-next-line max-len
      "For most other projects, observations that meet project requirements will automatically be included in projects.",
    ) ).toBeVisible( );
  } );

  it( "renders joined projects", ( ) => {
    renderAddToProjects( );

    expect( screen.getByText( mockProjects[0].title ) ).toBeVisible( );
    expect( screen.getByText( mockProjects[1].title ) ).toBeVisible( );
    expect( screen.getAllByText( "Traditional Project" ).length ).toBe( 2 );
  } );
} );
