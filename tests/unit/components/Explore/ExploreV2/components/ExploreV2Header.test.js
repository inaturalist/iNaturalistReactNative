import { screen } from "@testing-library/react-native";
import ExploreV2Header from "components/Explore/ExploreV2/components/ExploreV2Header";
import { EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";
import React from "react";
import { renderComponent } from "tests/helpers/render";

const mockNavigate = jest.fn();

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      navigate: mockNavigate,
      goBack: jest.fn(),
      push: jest.fn(),
      canGoBack: jest.fn( () => false ),
      dispatch: jest.fn(),
    } ),
  };
} );

jest.mock( "providers/ExploreV2Context", () => {
  const actual = jest.requireActual( "providers/ExploreV2Context" );
  return {
    ...actual,
    useExploreV2: jest.fn(),
  };
} );

const { useExploreV2 } = require( "providers/ExploreV2Context" );

const PLACE_LOCATION = {
  placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
  place: { id: 1, display_name: "California" },
};

const setState = ( subject, location = PLACE_LOCATION ) => {
  useExploreV2.mockReturnValue( {
    state: {
      subject,
      location,
      sortBy: "created_at",
      filters: {},
    },
  } );
};

describe( "ExploreV2Header", () => {
  beforeEach( () => {
    mockNavigate.mockClear();
  } );

  it( "renders a user subject with login and location", () => {
    setState( { type: "user", user: { id: 7, login: "seth_msp" } } );
    renderComponent( <ExploreV2Header /> );

    expect( screen.getByText( "seth_msp" ) ).toBeTruthy();
    expect( screen.getByText( "California" ) ).toBeTruthy();
  } );

  it( "renders a user subject icon", () => {
    setState( {
      type: "user",
      user: { id: 7, login: "seth_msp", icon_url: "https://example.com/u.jpg" },
    } );
    renderComponent( <ExploreV2Header /> );

    expect( screen.getByTestId( "UserIcon.photo" ) ).toBeTruthy();
  } );

  it( "renders a project subject with its icon image and location", () => {
    setState( {
      type: "project",
      project: { id: 9, title: "Backyard Birds", icon: "https://example.com/p.jpg" },
    } );
    renderComponent( <ExploreV2Header /> );

    expect( screen.getByText( "Backyard Birds" ) ).toBeTruthy();
    expect( screen.getByTestId( "ExploreV2Header.projectImage" ) ).toBeTruthy();
    expect( screen.getByText( "California" ) ).toBeTruthy();
  } );

  it( "renders a fallback briefcase for a project without an icon", () => {
    setState( {
      type: "project",
      project: { id: 9, title: "Backyard Birds" },
    } );
    renderComponent( <ExploreV2Header /> );

    expect( screen.getByText( "Backyard Birds" ) ).toBeTruthy();
    expect( screen.queryByTestId( "ExploreV2Header.projectImage" ) ).toBeNull();
    expect( screen.getByTestId( "ExploreV2Header.projectFallbackIcon" ) ).toBeTruthy();
  } );

  it( "renders a taxon subject with its photo and location", () => {
    setState( {
      type: "taxon",
      taxon: {
        id: 12,
        name: "Eumyias thalassinus",
        default_photo: { url: "https://example.com/photo.jpg" },
        iconic_taxon_name: "Aves",
      },
    } );
    renderComponent( <ExploreV2Header /> );

    expect( screen.getByTestId( "ExploreV2Header.taxonImage" ) ).toBeTruthy();
    expect( screen.getByText( "California" ) ).toBeTruthy();
  } );

  it( "renders an iconic taxon icon when a taxon has no photo", () => {
    setState( {
      type: "taxon",
      taxon: {
        id: 12,
        name: "Eumyias thalassinus",
        iconic_taxon_name: "Aves",
      },
    } );
    renderComponent( <ExploreV2Header /> );

    expect( screen.queryByTestId( "ExploreV2Header.taxonImage" ) ).toBeNull();
    expect( screen.getByTestId( "IconicTaxonName.iconicTaxonIcon" ) ).toBeTruthy();
  } );

  it( "renders the Unobserved title and location without a subject thumbnail", () => {
    setState(
      { type: "unobserved", user: { id: 7, login: "seth_msp" } },
      { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE },
    );
    renderComponent( <ExploreV2Header /> );

    expect( screen.getByText( "Unobserved" ) ).toBeTruthy();
    expect( screen.getByText( "Worldwide" ) ).toBeTruthy();
    expect( screen.getByTestId( "ExploreV2Header.unobserved" ) ).toBeTruthy();
    expect( screen.queryByTestId( "ExploreV2Header.subject" ) ).toBeNull();
  } );

  it( "renders only the place name when there is no subject", () => {
    setState( null );
    renderComponent( <ExploreV2Header /> );

    expect( screen.getByText( "California" ) ).toBeTruthy();
    expect( screen.queryByTestId( "ExploreV2Header.subject" ) ).toBeNull();
  } );

  it( "renders the Worldwide label when location is worldwide", () => {
    setState( null, { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE } );
    renderComponent( <ExploreV2Header /> );

    expect( screen.getByText( "Worldwide" ) ).toBeTruthy();
  } );

  it( "renders the Nearby label when location is nearby", () => {
    setState( null, {
      placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
      lat: 1,
      lng: 2,
      radius: 1,
    } );
    renderComponent( <ExploreV2Header /> );

    expect( screen.getByText( "Nearby" ) ).toBeTruthy();
  } );

  it( "renders the Nearby label when nearby is intended but permission is pending", () => {
    setState( null, { placeMode: EXPLORE_V2_PLACE_MODE.NEEDS_PERMISSION } );
    renderComponent( <ExploreV2Header /> );

    expect( screen.getByText( "Nearby" ) ).toBeTruthy();
  } );
} );
