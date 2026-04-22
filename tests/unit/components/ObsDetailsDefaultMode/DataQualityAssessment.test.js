import { useRoute } from "@react-navigation/native";
import { screen } from "@testing-library/react-native";
import DQAContainer from "components/ObsDetails/DQAContainer";
import { t } from "i18next";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockObservation = factory( "LocalObservation", {
  observed_on: "2023-12-14T21:07:41-09:30",
  observationPhotos: [factory( "LocalObservationPhoto" )],
  latitude: Number( faker.location.latitude( ) ),
  longitude: Number( faker.location.longitude( ) ),
  taxon: {
    id: undefined,
    rank_level: undefined,
  },
  identifications: [],
  // casual is the default, so using needs_id here ensures test
  // is using our mock observation, not just showing the default screen
  quality_grade: "needs_id",
  votes: [],
} );

const mockUserID = "some_user_id";

// Mock useCurrentUser hook
jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => ( {
    id: mockUserID,
  } ) ),
} ) );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: [],
  } ),
} ) );

const mockMutate = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", () => ( {
  __esModule: true,
  default: () => ( {
    mutate: mockMutate,
  } ),
} ) );

jest.mock( "sharedHooks/useLocalObservation", () => ( {
  __esModule: true,
  default: jest.fn( () => ( {
    localObservation: mockObservation,
  } ) ),
} ) );

jest.mock( "sharedHooks/useRemoteObservation", ( ) => ( {
  __esModule: true,
  default: ( _uuid, _fetchRemoteEnabled ) => ( {
    remoteObservation: mockObservation,
    refetchRemoteObservation: jest.fn( ),
    isRefetching: false,
  } ),
} ) );

useRoute.mockImplementation( ( ) => ( {
  params: {
    observationUUID: mockObservation.uuid,
  },
} ) );

describe( "Data Quality Assessment", ( ) => {
  test( "renders correct quality grade status", async ( ) => {
    renderComponent( <DQAContainer /> );

    const qualityGrade = await screen.findByTestId(
      `QualityGrade.${mockObservation.quality_grade}`,
    );
    expect( qualityGrade ).toBeTruthy( );
  } );

  test( "renders correct quality grade status title", async ( ) => {
    renderComponent( <DQAContainer /> );

    const qualityGrade = await screen.findByText(
      t( "Data-quality-assessment-title-needs-id" ),
    );
    expect( qualityGrade ).toBeTruthy( );
  } );

  test( "renders correct quality grade status description", async ( ) => {
    renderComponent( <DQAContainer /> );

    const qualityGrade = await screen.findByText(
      t( "Data-quality-assessment-description-needs-id" ),
    );
    expect( qualityGrade ).toBeTruthy( );
  } );

  test( "renders correct metric titles", async ( ) => {
    renderComponent( <DQAContainer /> );

    const dateSpecified = await screen.findByText(
      t( "Data-quality-assessment-date-specified" ),
    );
    const locationSpecified = await screen.findByText(
      t( "Data-quality-assessment-location-specified" ),
    );
    const photosAndSounds = await screen.findByText(
      t( "Data-quality-assessment-has-photos-or-sounds" ),
    );
    const idSupportedTwoOrMore = await screen.findByText(
      t( "Data-quality-assessment-id-supported-by-two-or-more" ),
    );
    const communityTaxonSpeciesLevel = await screen.findByText(
      t( "Data-quality-assessment-community-taxon-species-level-or-lower" ),
    );
    expect( dateSpecified ).toBeTruthy( );
    expect( locationSpecified ).toBeTruthy( );
    expect( photosAndSounds ).toBeTruthy( );
    expect( idSupportedTwoOrMore ).toBeTruthy( );
    expect( communityTaxonSpeciesLevel ).toBeTruthy( );
  } );

  test( "renders correct metric vote titles", async ( ) => {
    renderComponent( <DQAContainer /> );

    const dateAccurate = await screen.findByText(
      t( "Data-quality-assessment-date-is-accurate" ),
    );
    const locationAccurate = await screen.findByText(
      t( "Data-quality-assessment-location-is-accurate" ),
    );
    const organismWild = await screen.findByText(
      t( "Data-quality-assessment-organism-is-wild" ),
    );
    const organismEvidence = await screen.findByText(
      t( "Data-quality-assessment-evidence-of-organism" ),
    );
    const recentEvidence = await screen.findByText(
      t( "Data-quality-assessment-recent-evidence-of-organism" ),
    );
    expect( dateAccurate ).toBeTruthy( );
    expect( locationAccurate ).toBeTruthy( );
    expect( organismWild ).toBeTruthy( );
    expect( organismEvidence ).toBeTruthy( );
    expect( recentEvidence ).toBeTruthy( );
  } );

  test( "renders about section", async ( ) => {
    renderComponent( <DQAContainer /> );

    const title = await screen.findByText(
      t( "ABOUT-THE-DQA" ),
    );
    const description = await screen.findByText(
      t( "About-the-DQA-description" ),
    );
    expect( title ).toBeTruthy( );
    expect( description ).toBeTruthy( );
  } );
} );
