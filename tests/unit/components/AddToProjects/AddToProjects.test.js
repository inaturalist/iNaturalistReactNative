import { screen, userEvent, within } from "@testing-library/react-native";
import AddToProjects from "components/AddToProjects/AddToProjects";
import glyphmap from "components/SharedComponents/INatIcon/glyphmap.json";
import React from "react";
import { renderComponent } from "tests/helpers/render";

import {
  mockProjects,
  resetStore,
} from "./helpers/setupAddToProjects";

const actor = userEvent.setup( );

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

function renderAddToProjects( ) {
  return renderComponent(
    <AddToProjects />,
  );
}

beforeEach( ( ) => {
  jest.clearAllMocks( );
  resetStore( );
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

  it( "renders selected projects with expanded chooser", async ( ) => {
    renderAddToProjects( );

    const projectTitle = screen.getByText( mockProjects[1].title );
    await actor.press( projectTitle );

    expect(
      within( screen.getByTestId( `AddToProjects.project.${mockProjects[1].id}` ) )
        .getByText( iconGlyph( "circle-dots-pencil" ) ),
    ).toBeVisible( );

    // TODO: MOB-1503 also check for expanded chooser being shown
  } );

  // TODO: MOB-1498
  // In MOB-1499 we changed the UI state for checked to be entirely driven by OFV validation
  // jump-starting the UI with existing POFs has not been implemented yet.
  it.todo( "renders existing project observations as checked" );
} );
