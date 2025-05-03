import {
  fireEvent,
  screen,
  userEvent,
  waitFor
} from "@testing-library/react-native";
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

const mockTaxon = factory( "LocalTaxon" );

const actor = userEvent.setup( );

beforeAll( ( ) => {
  inatjs.observations.speciesCounts.mockResolvedValue( makeResponse( [{
    count: 1,
    taxon: mockTaxon
  }] ) );
  inatjs.observations.search.mockResolvedValue( makeResponse( [mockRemoteObservation] ) );
  jest.useFakeTimers( );
} );

const switchToSpeciesView = async ( ) => {
  const observationsViewIcon = await screen.findByLabelText( /Observations View/ );
  expect( observationsViewIcon ).toBeVisible( );
  await actor.press( observationsViewIcon );
  const speciesRadioButton = await screen.findByText( "Species" );
  await actor.press( speciesRadioButton );
  const confirmButton = await screen.findByText( /EXPLORE SPECIES/ );
  await actor.press( confirmButton );
  const speciesViewIcon = await screen.findByLabelText( /Species View/ );
  expect( speciesViewIcon ).toBeVisible( );
};

describe( "Explore", ( ) => {
  it( "should render observations view list correctly on page load", async ( ) => {
    renderAppWithComponent( <ExploreContainer /> );
    const observationsViewIcon = await screen.findByLabelText( /Observations View/ );
    expect( observationsViewIcon ).toBeVisible( );
    const obsTaxonNameElt = await screen.findByText( mockRemoteObservation.taxon.name );
    expect( obsTaxonNameElt ).toBeTruthy( );
    expect(
      screen.queryByTestId( `UploadIcon.progress.${mockRemoteObservation.uuid}` )
    ).toBeFalsy( );
  } );

  it( "should switch to species view list correctly", async ( ) => {
    renderAppWithComponent( <ExploreContainer /> );
    await switchToSpeciesView( );
  } );

  it( "should display observations view grid correctly", async ( ) => {
    renderAppWithComponent( <ExploreContainer /> );
    expect(
      await screen.findByTestId( "SegmentedButton.grid" )
    ).toBeTruthy( );
    fireEvent.press( await screen.findByTestId( "SegmentedButton.grid" ) );
    expect(
      screen.queryByTestId( `UploadIcon.progress.${mockRemoteObservation.uuid}` )
    ).toBeFalsy( );
  } );

  it( "should trigger new observation fetch on pull-to-refresh in list view", async ( ) => {
    renderAppWithComponent( <ExploreContainer /> );
    expect(
      await screen.findByTestId( "SegmentedButton.list" )
    ).toBeTruthy( );
    fireEvent.press( await screen.findByTestId( "SegmentedButton.list" ) );

    const exploreObsList = await screen.findByTestId( "ExploreObservationsAnimatedList" );

    // This should be called by default to load some content
    expect( inatjs.observations.search ).toHaveBeenCalled( );

    // Now we want to make sure it gets called again, so we clear it
    inatjs.observations.search.mockClear( );
    expect( inatjs.observations.search ).not.toHaveBeenCalled( );
    await waitFor( async ( ) => {
      await exploreObsList.props.refreshControl.props.onRefresh( );
      expect( inatjs.observations.search ).toHaveBeenCalled( );
    } );
  } );

  it( "should trigger new observation fetch when filters change", async ( ) => {
    renderAppWithComponent( <ExploreContainer /> );

    // Clear the mock so we can make sure it gets called again
    inatjs.observations.search.mockClear( );
    expect( inatjs.observations.search ).not.toHaveBeenCalled( );
    // Open filters, change one, and apply
    const filtersButton = await screen.findByLabelText( "Filters" );
    fireEvent.press( filtersButton );
    const rgLabel = await screen.findByText( "Research Grade" );
    fireEvent.press( rgLabel );
    const applyButton = await screen.findByText( "APPLY FILTERS" );
    expect( applyButton.disabled ).toBeFalsy( );
    fireEvent.press( applyButton );

    // Changing a filter should trigger a call to this endpoint
    await waitFor( ( ) => {
      expect( inatjs.observations.search ).toHaveBeenCalled( );
    } );
  } );
} );
