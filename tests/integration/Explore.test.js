import { fireEvent, screen, userEvent } from "@testing-library/react-native";
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
  const confirmButton = await screen.findByText( /EXPLORE OBSERVATIONS/ );
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

    fireEvent.scroll( exploreObsList, {
      nativeEvent: {
        contentOffset: { y: -100 },
        contentSize: { height: 1000, width: 100 },
        layoutMeasurement: { height: 500, width: 100 }
      }
    } );
    expect( inatjs.observations.search ).toHaveBeenCalled( );
  } );
} );
