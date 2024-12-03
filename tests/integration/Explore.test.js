import {
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within
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

const switchToObservationsView = async ( ) => {
  const speciesViewIcon = await screen.findByLabelText( /Species View/ );
  expect( speciesViewIcon ).toBeVisible( );
  await actor.press( speciesViewIcon );
  const observationsRadioButton = await screen.findByText( "Observations" );
  await actor.press( observationsRadioButton );
  const bottomSheet = await screen.findByTestId( "ExploreObsViewSheet" );
  const confirmButton = await within( bottomSheet ).findByText( /EXPLORE OBSERVATIONS/ );
  expect( confirmButton ).toBeVisible( );
  await actor.press( confirmButton );
  const obsTaxonNameElt = await screen.findByText( mockRemoteObservation.taxon.name );
  expect( obsTaxonNameElt ).toBeTruthy( );
};

describe( "Explore", ( ) => {
  it( "should render species view and switch to observations view list correctly", async ( ) => {
    renderAppWithComponent( <ExploreContainer /> );
    await switchToObservationsView( );
    expect(
      await screen.findByTestId( `ObsStatus.${mockRemoteObservation.uuid}` )
    ).toBeTruthy( );
    expect(
      screen.queryByTestId( `UploadIcon.progress.${mockRemoteObservation.uuid}` )
    ).toBeFalsy( );
  } );

  it( "should display observations view grid correctly", async ( ) => {
    renderAppWithComponent( <ExploreContainer /> );
    await switchToObservationsView( );
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

  it( "should trigger new observation fetch on pull-to-refresh", async ( ) => {
    renderAppWithComponent( <ExploreContainer /> );
    await switchToObservationsView( );

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
    await switchToObservationsView( );

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
