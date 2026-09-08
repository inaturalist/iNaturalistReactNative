import { screen, userEvent } from "@testing-library/react-native";
import ExploreV2Header from "components/Explore/ExploreV2/components/ExploreV2Header";
import { MEDIA } from "providers/ExploreContext";
import { defaultExploreV2Filters, EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";
import React from "react";
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

const mockNavigate = jest.fn();
const mockCanGoBack = jest.fn( () => false );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      navigate: mockNavigate,
      goBack: jest.fn(),
      push: jest.fn(),
      canGoBack: mockCanGoBack,
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

const setState = ( subject, location = PLACE_LOCATION, filters = defaultExploreV2Filters ) => {
  useExploreV2.mockReturnValue( {
    state: {
      subject,
      location,
      sortBy: "created_at",
      filters,
    },
  } );
};

describe( "ExploreV2Header", () => {
  beforeEach( () => {
    mockNavigate.mockClear();
    mockCanGoBack.mockReturnValue( false );
    useStore.getState().exploreV2AdvancedSearch.setAdvancedSearchMode( false );
  } );

  it( "renders a user subject with login and location", () => {
    setState( { type: "user", user: { id: 7, login: "seth_msp" } } );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect( screen.getByText( "seth_msp" ) ).toBeTruthy();
    expect( screen.getByText( "California" ) ).toBeTruthy();
  } );

  it( "renders a user subject icon", () => {
    setState( {
      type: "user",
      user: { id: 7, login: "seth_msp", icon_url: "https://example.com/u.jpg" },
    } );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect( screen.getByTestId( "UserIcon.photo" ) ).toBeTruthy();
  } );

  it( "renders a project subject with its icon image and location", () => {
    setState( {
      type: "project",
      project: { id: 9, title: "Backyard Birds", icon: "https://example.com/p.jpg" },
    } );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect( screen.getByText( "Backyard Birds" ) ).toBeTruthy();
    expect( screen.getByTestId( "ExploreV2Header.projectImage" ) ).toBeTruthy();
    expect( screen.getByText( "California" ) ).toBeTruthy();
  } );

  it( "renders a fallback briefcase for a project without an icon", () => {
    setState( {
      type: "project",
      project: { id: 9, title: "Backyard Birds" },
    } );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

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
    renderComponent( <ExploreV2Header showBackButton={false} /> );

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
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect( screen.queryByTestId( "ExploreV2Header.taxonImage" ) ).toBeNull();
    expect( screen.getByTestId( "IconicTaxonName.iconicTaxonIcon" ) ).toBeTruthy();
  } );

  it( "renders the Unobserved title and location without a subject thumbnail", () => {
    setState(
      { type: "unobserved", user: { id: 7, login: "seth_msp" } },
      { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE },
    );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect( screen.getByText( "Unobserved" ) ).toBeTruthy();
    expect( screen.getByText( "Worldwide" ) ).toBeTruthy();
    expect( screen.getByTestId( "ExploreV2Header.unobserved" ) ).toBeTruthy();
    expect( screen.queryByTestId( "ExploreV2Header.subject" ) ).toBeNull();
  } );

  it( "renders an unknown subject with the iconic-unknown icon and Unknown label", () => {
    setState( { type: "unknown" } );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect( screen.getByTestId( "ExploreV2Header.subject" ) ).toBeTruthy();
    expect( screen.getByTestId( "IconicTaxonName.iconicTaxonIcon" ) ).toBeTruthy();
    expect( screen.getByText( "Unknown" ) ).toBeTruthy();
    expect( screen.getByText( "California" ) ).toBeTruthy();
  } );

  it( "renders only the place name when there is no subject", () => {
    setState( null );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect( screen.getByText( "California" ) ).toBeTruthy();
    expect( screen.queryByTestId( "ExploreV2Header.subject" ) ).toBeNull();
  } );

  it( "renders the Worldwide label when location is worldwide", () => {
    setState( null, { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE } );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect( screen.getByText( "Worldwide" ) ).toBeTruthy();
  } );

  it( "renders the Nearby label when location is nearby", () => {
    setState( null, { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY } );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect( screen.getByText( "Nearby" ) ).toBeTruthy();
  } );

  it( "renders the Map Area label when location is a map area", () => {
    setState( null, {
      placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA,
      bounds: {
        swlat: 1, swlng: 2, nelat: 3, nelng: 4,
      },
    } );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect( screen.getByText( "Map Area" ) ).toBeTruthy();
  } );

  it( "navigates to Universal Search when the header is tapped", async () => {
    const actor = userEvent.setup();
    setState( null );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    await actor.press( screen.getByTestId( "ExploreV2Header.pressable" ) );

    expect( mockNavigate ).toHaveBeenCalledWith( "UniversalSearch" );
  } );

  it( "navigates to Universal Search when the search button is tapped", async () => {
    const actor = userEvent.setup();
    setState( null );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    await actor.press( screen.getByLabelText( "Search" ) );

    expect( mockNavigate ).toHaveBeenCalledWith( "UniversalSearch" );
  } );

  it( "navigates to Advanced Search from a filters button in advanced search mode", async () => {
    const actor = userEvent.setup();
    useStore.getState().exploreV2AdvancedSearch.setAdvancedSearchMode( true );
    setState( null );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect( screen.queryByLabelText( "Search" ) ).toBeNull();
    await actor.press( screen.getByLabelText( "Filters" ) );

    expect( mockNavigate ).toHaveBeenCalledWith( "AdvancedSearch" );
  } );

  it( "renders no back button at the root of the Explore tab", () => {
    // the bottom tabs' backBehavior="history" makes canGoBack true whenever
    // the user arrived from another tab
    mockCanGoBack.mockReturnValue( true );
    setState( null );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect( screen.queryByTestId( "BackButton" ) ).toBeNull();
  } );

  it( "renders a back button when Explore was pushed onto another screen", () => {
    mockCanGoBack.mockReturnValue( true );
    setState( null );
    renderComponent( <ExploreV2Header showBackButton /> );

    expect( screen.getByTestId( "BackButton" ) ).toBeVisible();
  } );

  it( "badges the filters button with the number of filters applied", () => {
    useStore.getState().exploreV2AdvancedSearch.setAdvancedSearchMode( true );
    setState( null, PLACE_LOCATION, {
      ...defaultExploreV2Filters,
      casual: true,
      media: MEDIA.SOUNDS,
    } );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect( screen.getByText( "2", { includeHiddenElements: true } ) ).toBeTruthy();
  } );

  it( "shows no badge when the search has no filters", () => {
    useStore.getState().exploreV2AdvancedSearch.setAdvancedSearchMode( true );
    setState( null );
    renderComponent( <ExploreV2Header showBackButton={false} /> );

    expect(
      screen.queryByTestId( "ExploreV2Header.filterCount", { includeHiddenElements: true } ),
    ).toBeNull();
    expect( screen.getByLabelText( "Filters" ) ).toBeVisible();
  } );
} );
