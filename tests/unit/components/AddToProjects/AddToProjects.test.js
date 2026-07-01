import { screen, within } from "@testing-library/react-native";
import AddToProjects from "components/AddToProjects/AddToProjects";
import glyphmap from "components/SharedComponents/INatIcon/glyphmap.json";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockProjects = [
  factory( "LocalProject" ),
  factory( "LocalProject" ),
];

const iconGlyph = name => String.fromCharCode( glyphmap[name] );

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

  it( "renders existing project observations as checked", ( ) => {
    renderAddToProjects( );

    expect(
      within( screen.getByTestId( `AddToProjects.project.${mockProjects[0].id}` ) )
        .getByText( iconGlyph( "checkmark-circle" ) ),
    ).toBeVisible( );
    expect(
      within( screen.getByTestId( `AddToProjects.project.${mockProjects[1].id}` ) )
        .queryByText( iconGlyph( "checkmark-circle" ) ),
    ).toBeNull( );
  } );
} );
