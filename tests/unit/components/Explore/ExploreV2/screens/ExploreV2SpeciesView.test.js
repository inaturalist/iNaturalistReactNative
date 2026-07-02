import { screen } from "@testing-library/react-native";
import ExploreV2SpeciesView
  from "components/Explore/ExploreV2/screens/ExploreV2SpeciesView";
import initI18next from "i18n/initI18next";
import { ExploreV2Provider } from "providers/ExploreV2Context";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockSpeciesCounts = [
  {
    count: 12,
    taxon: {
      ...factory( "RemoteTaxon" ),
      id: 745,
      name: "Silphium perfoliatum",
      preferred_common_name: "Cup Plant",
      rank_level: 10,
    },
  },
  {
    count: 7,
    taxon: {
      ...factory( "RemoteTaxon" ),
      id: 746,
      name: "Silphium laciniatum",
      preferred_common_name: "Compass Plant",
      rank_level: 10,
    },
  },
];

const mockedNavigate = jest.fn( );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( { navigate: mockedNavigate } ),
    useRoute: () => ( { key: "test-route-key" } ),
    useNavigationState: jest.fn( ),
  };
} );

jest.mock( "sharedHooks/useInfiniteScroll", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockSpeciesCounts,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn( ),
    totalResults: mockSpeciesCounts.length,
  } ),
} ) );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( { data: { total_results: 0 } } ),
} ) );

const mockUseCurrentUser = jest.fn( () => null );
jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => mockUseCurrentUser( ),
} ) );

const mockUseQuery = jest.fn( () => ( { data: undefined } ) );
jest.mock( "sharedHooks/useQuery", () => ( {
  __esModule: true,
  default: () => mockUseQuery( ),
} ) );

const renderView = ( props = {} ) => renderComponent(
  <ExploreV2Provider requestLocationPermissions={() => {}}>
    <ExploreV2SpeciesView
      enabled
      isConnected
      params={{}}
      {...props}
    />
  </ExploreV2Provider>,
);

beforeAll( async () => {
  await initI18next( );
} );

beforeEach( () => {
  mockUseCurrentUser.mockReturnValue( null );
  mockUseQuery.mockReturnValue( { data: undefined } );
} );

describe( "ExploreV2SpeciesView", () => {
  it( "renders a grid card for each species-count result", async () => {
    renderView( );

    expect(
      await screen.findByTestId( "TaxonGridItem.Pressable.745" ),
    ).toBeTruthy( );
    expect(
      await screen.findByTestId( "TaxonGridItem.Pressable.746" ),
    ).toBeTruthy( );
  } );

  it( "renders the observation count for each species", async () => {
    renderView( );

    expect( await screen.findByText( "12 Observations" ) ).toBeTruthy( );
    expect( await screen.findByText( "7 Observations" ) ).toBeTruthy( );
  } );

  it( "shows a seen checkmark only for species the current user has observed", async () => {
    mockUseCurrentUser.mockReturnValue( factory( "LocalUser" ) );
    mockUseQuery.mockReturnValue( {
      data: { results: [{ taxon: { id: 745 } }] },
    } );

    renderView( );

    expect( await screen.findAllByTestId( "SpeciesSeenCheckmark" ) ).toHaveLength( 1 );
  } );

  it( "shows no seen checkmarks when signed out", async () => {
    renderView( );

    await screen.findByTestId( "TaxonGridItem.Pressable.745" );
    expect( screen.queryByTestId( "SpeciesSeenCheckmark" ) ).toBeNull( );
  } );
} );
