import faker from "tests/helpers/faker";
import { fireEvent, screen } from "@testing-library/react-native";
import DQAVoteButtons from "components/ObsDetails/DetailsTab/DQAVoteButtons";
import DQAContainer from "components/ObsDetails/DQAContainer";
import initI18next from "i18n/initI18next";
import { t } from "i18next";
import React from "react";
import { View } from "react-native";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

jest.mock( "sharedHooks/useIsConnected", ( ) => ( {
  __esModule: true,
  default: ( ) => true
} ) );

const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  observed_on: "2023-12-14T21:07:41-09:30",
  taxon: factory( "LocalTaxon", {
    id: "1234",
    rank_level: 10
  } ),
  observationPhotos: [
    factory( "LocalObservationPhoto", {
      photo: {
        id: faker.number.int( ),
        attribution: faker.lorem.sentence( ),
        licenseCode: "cc-by-nc",
        url: faker.image.url( )
      }
    } )
  ],
  identifications: [factory( "LocalIdentification", {
    taxon: factory( "LocalTaxon", {
      id: "1234",
      rank_level: 10
    } )
  } )],
  latitude: Number( faker.location.latitude( ) ),
  longitude: Number( faker.location.longitude( ) ),
  description: faker.lorem.paragraph( ),
  quality_grade: "casual"
} );

const mockQualityMetrics = [
  {
    id: 0,
    agree: true,
    metric: "wild",
    user_id: "0"
  }
];

const mockObservationObject = {
  date: mockObservation.observed_on,
  location: [mockObservation.latitude, mockObservation.longitude],
  evidence: mockObservation.observationPhotos,
  taxon: {
    id: mockObservation.taxon.id,
    rank_level: mockObservation.taxon.rank_level
  },
  identifications: mockObservation.identifications
};

const mockMutate = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", () => ( {
  __esModule: true,
  default: () => ( {
    mutate: mockMutate

  } )
} ) );

const mockAttribution = <View testID="mock-attribution" />;
jest.mock( "components/ObsDetails/DetailsTab/Attribution", () => ( {
  __esModule: true,
  default: () => mockAttribution
} ) );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: () => ( {
      params: {
        observationUUID: mockObservation.uuid,
        observation: mockObservationObject,
        qualityGrade: mockObservation.quality_grade
      }
    } )
  };
} );

describe( "Data Quality Assessment", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );
  test( "renders correct quality grade status", async ( ) => {
    renderComponent( <DQAContainer qualityGrade={mockObservation.quality_grade} /> );

    const qualityGrade = await screen.findByTestId(
      `QualityGrade.${mockObservation.quality_grade}`
    );
    expect( qualityGrade ).toBeTruthy( );
  } );
  test( "renders correct quality grade status title", async ( ) => {
    renderComponent( <DQAContainer observation={mockObservation} /> );

    const qualityGrade = await screen.findByText(
      t( "Data-quality-assessment-title-casual" )
    );
    expect( qualityGrade ).toBeTruthy( );
  } );
  test( "renders correct quality grade status description", async ( ) => {
    renderComponent( <DQAContainer observation={mockObservation} /> );

    const qualityGrade = await screen.findByText(
      t( "Data-quality-assessment-description-casual" )
    );
    expect( qualityGrade ).toBeTruthy( );
  } );
  test( "renders correct metric titles", async ( ) => {
    renderComponent( <DQAContainer observation={mockObservation} /> );

    const dateSpecified = await screen.findByText(
      t( "Data-quality-assessment-date-specified" )
    );
    const locationSpecified = await screen.findByText(
      t( "Data-quality-assessment-location-specified" )
    );
    const photosAndSounds = await screen.findByText(
      t( "Data-quality-assessment-has-photos-or-sounds" )
    );
    const idSupportedTwoOrMore = await screen.findByText(
      t( "Data-quality-assessment-id-supported-by-two-or-more" )
    );
    const communityTaxonSpeciesLevel = await screen.findByText(
      t( "Data-quality-assessment-community-taxon-species-level-or-lower" )
    );
    expect( dateSpecified ).toBeTruthy( );
    expect( locationSpecified ).toBeTruthy( );
    expect( photosAndSounds ).toBeTruthy( );
    expect( idSupportedTwoOrMore ).toBeTruthy( );
    expect( communityTaxonSpeciesLevel ).toBeTruthy( );
  } );

  test( "renders correct metric vote titles", async ( ) => {
    renderComponent( <DQAContainer observation={mockObservation} /> );

    const dateAccurate = await screen.findByText(
      t( "Data-quality-assessment-date-is-accurate" )
    );
    const locationAccurate = await screen.findByText(
      t( "Data-quality-assessment-location-is-accurate" )
    );
    const organismWild = await screen.findByText(
      t( "Data-quality-assessment-organism-is-wild" )
    );
    const organismEvidence = await screen.findByText(
      t( "Data-quality-assessment-evidence-of-organism" )
    );
    const recentEvidence = await screen.findByText(
      t( "Data-quality-assessment-recent-evidence-of-organism" )
    );
    expect( dateAccurate ).toBeTruthy( );
    expect( locationAccurate ).toBeTruthy( );
    expect( organismWild ).toBeTruthy( );
    expect( organismEvidence ).toBeTruthy( );
    expect( recentEvidence ).toBeTruthy( );
  } );
  test( "renders about section", async ( ) => {
    renderComponent( <DQAContainer observation={mockObservation} /> );

    const title = await screen.findByText(
      t( "ABOUT-THE-DQA" )
    );
    const description = await screen.findByText(
      t( "About-the-DQA-description" )
    );
    expect( title ).toBeTruthy( );
    expect( description ).toBeTruthy( );
  } );
} );

describe( "DQA Vote Buttons", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );
  test( "renders DQA vote buttons", async ( ) => {
    renderComponent( <DQAContainer observation={mockObservation} /> );

    const emptyDisagreeButtons = await screen.findAllByTestId( "DQAVoteButton.EmptyDisagree" );
    fireEvent.press( emptyDisagreeButtons[0] );

    expect( await mockMutate ).toHaveBeenCalled();
  } );

  test( "calls api when DQA disagree button is pressed", async ( ) => {
    renderComponent( <DQAContainer observation={mockObservation} /> );

    const emptyDisagreeButtons = await screen.findAllByTestId( "DQAVoteButton.EmptyDisagree" );
    fireEvent.press( emptyDisagreeButtons[0] );

    expect( await mockMutate ).toHaveBeenCalled();
  } );

  test( "calls api when DQA agree button is pressed", async ( ) => {
    renderComponent( <DQAContainer observation={mockObservation} /> );

    const emptyDisagreeButtons = await screen.findAllByTestId( "DQAVoteButton.EmptyAgree" );
    fireEvent.press( emptyDisagreeButtons[0] );

    expect( await mockMutate ).toHaveBeenCalled();
  } );

  test( "renders correct DQA user vote", async ( ) => {
    renderComponent( <DQAVoteButtons
      metric="wild"
      qualityMetrics={mockQualityMetrics}
      setVote={jest.fn()}
      loadingAgree={jest.fn()}
      loadingDisagree={jest.fn()}
      loadingMetric={jest.fn()}
      removeVote={jest.fn()}
    /> );

    const button = await screen.findByTestId(
      "DQAVoteButton.UserAgree"
    );
    expect( button ).toBeTruthy( );
  } );

  test( "renders correct DQA user vote number", async ( ) => {
    renderComponent( <DQAVoteButtons
      metric="wild"
      qualityMetrics={mockQualityMetrics}
      setVote={jest.fn()}
      loadingAgree={jest.fn()}
      loadingDisagree={jest.fn()}
      loadingMetric={jest.fn()}
      removeVote={jest.fn()}
    /> );

    const voteNumber = await screen.findByText(
      "1"
    );
    expect( voteNumber ).toBeTruthy( );
  } );
} );
