import { fireEvent, screen } from "@testing-library/react-native";
import UniversalSearchResult
  from "components/Explore/ExploreV2/components/UniversalSearchResult";
import initI18next from "i18n/initI18next";
import React from "react";
import { renderComponent } from "tests/helpers/render";

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
const useCurrentUser = require( "sharedHooks/useCurrentUser" ).default;

const TAXON_WITH_PHOTO = {
  type: "taxon",
  taxon: {
    id: 12,
    name: "Eumyias thalassinus",
    preferred_common_name: "Verditer Flycatcher",
    iconic_taxon_name: "Aves",
    default_photo: { url: "https://example.com/t.jpg" },
  },
};

const TAXON_WITHOUT_PHOTO = {
  type: "taxon",
  taxon: {
    id: 13,
    name: "Plantae",
    iconic_taxon_name: "Plantae",
  },
};

const USER_RESULT = {
  type: "user",
  user: {
    id: 7,
    login: "seth_msp",
    icon_url: "https://example.com/u.jpg",
    observations_count: 5,
  },
};

const PROJECT_RESULT = {
  type: "project",
  project: {
    id: 9,
    title: "InverteFest",
    project_type: "collection",
    rule_preferences: [],
    icon: "https://example.com/p.jpg",
  },
};

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  useCurrentUser.mockReturnValue( {
    prefers_common_names: true,
    prefers_scientific_name_first: false,
  } );
} );

describe( "UniversalSearchResult", ( ) => {
  it( "renders a taxon result with its photo", ( ) => {
    renderComponent(
      <UniversalSearchResult result={TAXON_WITH_PHOTO} onPress={jest.fn( )} />,
    );

    expect( screen.getByTestId( "UniversalSearchResult.taxon.12" ) ).toBeTruthy( );
    expect( screen.getByTestId( "UniversalSearchResult.taxonImage" ) ).toBeTruthy( );
    expect( screen.getByText( "Verditer Flycatcher" ) ).toBeTruthy( );
  } );

  it( "falls back to the iconic taxon icon when a taxon has no photo", ( ) => {
    renderComponent(
      <UniversalSearchResult result={TAXON_WITHOUT_PHOTO} onPress={jest.fn( )} />,
    );

    expect( screen.getByTestId( "UniversalSearchResult.taxon.13" ) ).toBeTruthy( );
    expect( screen.queryByTestId( "UniversalSearchResult.taxonImage" ) ).toBeNull( );
    expect( screen.getByTestId( "IconicTaxonName.iconicTaxonIcon" ) ).toBeTruthy( );
  } );

  it( "renders a user result with its login and observation count", ( ) => {
    renderComponent(
      <UniversalSearchResult result={USER_RESULT} onPress={jest.fn( )} />,
    );

    expect( screen.getByTestId( "UniversalSearchResult.user.7" ) ).toBeTruthy( );
    expect( screen.getByText( "seth_msp" ) ).toBeTruthy( );
  } );

  it( "renders a project result with its title", ( ) => {
    renderComponent(
      <UniversalSearchResult result={PROJECT_RESULT} onPress={jest.fn( )} />,
    );

    expect( screen.getByTestId( "UniversalSearchResult.project.9" ) ).toBeTruthy( );
    expect( screen.getByText( "InverteFest" ) ).toBeTruthy( );
  } );

  it( "calls onPress when the row is tapped", ( ) => {
    const onPress = jest.fn( );
    renderComponent(
      <UniversalSearchResult result={USER_RESULT} onPress={onPress} />,
    );

    fireEvent.press( screen.getByTestId( "UniversalSearchResult.user.7" ) );

    expect( onPress ).toHaveBeenCalledTimes( 1 );
  } );
} );
