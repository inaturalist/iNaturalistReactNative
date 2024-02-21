import { fireEvent, screen } from "@testing-library/react-native";
import ExploreContainer from "components/Explore/ExploreContainer";
import inatjs from "inaturalistjs";
import React from "react";
import factory, { makeResponse } from "tests/factory";
import { renderAppWithComponent } from "tests/helpers/render";

jest.mock( "sharedHooks/useStoredLayout", () => ( {
  __esModule: true,
  default: ( ) => ( {
    layout: "list",
    writeLayoutToStorage: jest.fn( )
  } )
} ) );

const mockRemoteObservation = factory( "RemoteObservation", {
  taxon: factory.states( "genus" )( "RemoteTaxon" )
} );

describe( "Explore", ( ) => {
  it( "should render", async ( ) => {
    inatjs.observations.search.mockResolvedValue( makeResponse( [mockRemoteObservation] ) );
    renderAppWithComponent( <ExploreContainer /> );
    const obsTaxonNameElt = await screen.findByText( mockRemoteObservation.taxon.name );
    expect( obsTaxonNameElt ).toBeTruthy( );
    expect(
      await screen.findByTestId( `ObsStatus.${mockRemoteObservation.uuid}` )
    ).toBeTruthy( );
    expect(
      screen.queryByTestId( `UploadIcon.progress.${mockRemoteObservation.uuid}` )
    ).toBeFalsy( );
  } );
  it( "should display grid item correctly", async ( ) => {
    inatjs.observations.search.mockResolvedValue( makeResponse( [mockRemoteObservation] ) );
    renderAppWithComponent( <ExploreContainer /> );
    const obsTaxonNameElt = await screen.findByText( mockRemoteObservation.taxon.name );
    expect( obsTaxonNameElt ).toBeTruthy( );
    expect(
      await screen.findByTestId( "SegmentedButton.grid" )
    ).toBeTruthy( );
    fireEvent.press( await screen.findByTestId( "SegmentedButton.grid" ) );
    expect(
      await screen.findByTestId( `ObsStatus.${mockRemoteObservation.uuid}` )
    ).toBeTruthy( );
    expect(
      screen.queryByTestId( `UploadIcon.progress.${mockRemoteObservation.uuid}` )
    ).toBeFalsy( );
  } );
} );
