import { fireEvent, screen } from "@testing-library/react-native";
import ExploreContainer from "components/Explore/ExploreContainer";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import React from "react";

import factory, { makeResponse } from "../factory";
import { renderAppWithComponent } from "../helpers/render";

const mockRemoteObservation = factory( "RemoteObservation", {
  taxon: factory.states( "genus" )( "RemoteTaxon" )
} );

const mockIconicTaxon = factory( "RemoteTaxon", {
  is_iconic: true
} );

describe( "Explore", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should render", async ( ) => {
    inatjs.observations.search.mockResolvedValue( makeResponse( [mockRemoteObservation] ) );
    // TODO find a more generic way to do this
    inatjs.taxa.search.mockResolvedValue( makeResponse( [mockIconicTaxon] ) );
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
    // TODO find a more generic way to do this
    inatjs.taxa.search.mockResolvedValue( makeResponse( [mockIconicTaxon] ) );
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
