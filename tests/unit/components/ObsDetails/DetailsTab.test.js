import faker from "tests/helpers/faker";
import { screen } from "@testing-library/react-native";
import DetailsTab from "components/ObsDetails/DetailsTab/DetailsTab";

import React from "react";
import { View } from "react-native";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

jest.mock( "sharedHooks/useIsConnected", ( ) => ( {
  __esModule: true,
  default: ( ) => true
} ) );

// Before migrating to Jest 27 this line was:
// jest.useFakeTimers();
// TODO: replace with modern usage of jest.useFakeTimers
// jest.useFakeTimers( {
//   legacyFakeTimers: true
// } );

const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  latitude: Number( faker.location.latitude( ) ),
  longitude: Number( faker.location.longitude( ) ),
  description: faker.lorem.paragraph( ),
  quality_grade: "casual"
} );

const mockObservationWithTaxon = {
  ...mockObservation,
  taxon: factory( "LocalTaxon" )
};

const mockAttribution = <View testID="mock-attribution" />;
jest.mock( "components/ObsDetails/DetailsTab/Attribution", () => ( {
  __esModule: true,
  default: () => mockAttribution
} ) );

const baseUrl = "https://api.inaturalist.org/v2/grid/{z}/{x}/{y}.png";

describe( "DetailsTab", ( ) => {

  test( "should show description of observation", async ( ) => {
    renderComponent( <DetailsTab observation={mockObservation} /> );

    const description = await screen.findByText( mockObservation.description );
    expect( description ).toBeTruthy( );
  } );

  test( "should display map if user is online", ( ) => {
    renderComponent( <DetailsTab observation={mockObservation} /> );

    const map = screen.queryByTestId( "MapView" );
    expect( map ).toBeTruthy( );

    const noInternet = screen.queryByRole( "image", { name: "wifi-off" } );
    expect( noInternet ).toBeNull( );
  } );

  test( "should show tiles on map for given taxon", ( ) => {
    renderComponent( <DetailsTab observation={mockObservationWithTaxon} /> );

    const map = screen.queryByTestId( "MapView" );
    expect( map ).toBeTruthy( );

    const tiles = screen.getByTestId( "Map.UrlTile" );
    expect( tiles ).toBeVisible( );
    expect( tiles ).toHaveProp(
      "urlTemplate",
      `${baseUrl}?taxon_id=${mockObservationWithTaxon.taxon.id}&color=%2374ac00&verifiable=true`
    );
  } );

  test( "should not show tiles for observation with no taxon id", ( ) => {
    renderComponent( <DetailsTab observation={mockObservation} /> );

    const map = screen.queryByTestId( "MapView" );
    expect( map ).toBeTruthy( );

    const tiles = screen.queryByTestId( "Map.UrlTile" );
    expect( tiles ).toBeFalsy( );
  } );

  test( "should display current location coordinates", async ( ) => {
    renderComponent( <DetailsTab observation={mockObservation} /> );
    const lat = mockObservation.latitude;
    const long = mockObservation.longitude;
    const location = await screen.findByText( `Lat: ${lat}, Lon: ${long}, Acc: none` );
    expect( location ).toBeTruthy( );
  } );

  test( "should show data quality options", async ( ) => {
    renderComponent( <DetailsTab observation={mockObservation} /> );

    const qualityGradeCasual = await screen.findByTestId( "QualityGrade.casual" );
    const qualityGradeNeedsId = await screen.findByTestId( "QualityGrade.needs_id" );
    const qualityGradeResearch = await screen.findByTestId( "QualityGrade.research" );
    expect( qualityGradeCasual ).toBeTruthy( );
    expect( qualityGradeNeedsId ).toBeTruthy( );
    expect( qualityGradeResearch ).toBeTruthy( );
  } );

  test( "should display DQA button", async ( ) => {
    renderComponent( <DetailsTab observation={mockObservation} /> );
    const DQAButton = await screen.findByTestId( "DetailsTab.DQA" );
    expect( DQAButton ).toBeTruthy( );
  } );
} );
