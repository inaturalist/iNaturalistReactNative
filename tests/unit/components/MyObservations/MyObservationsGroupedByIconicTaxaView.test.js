import { screen, userEvent, within } from "@testing-library/react-native";
import MyObservationsGroupedByIconicTaxaView
  from "components/MyObservations/MyObservationsGroupedByIconicTaxaView";
import initI18next from "i18n/initI18next";
import React from "react";
import { ICONIC_TAXA_GROUP } from "sharedHelpers/iconicTaxaGroupOrder";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockCounts = [
  { category: ICONIC_TAXA_GROUP.PLANTAE, count: 45 },
  { category: ICONIC_TAXA_GROUP.AVES, count: 30 },
  { category: ICONIC_TAXA_GROUP.INSECTA, count: 20 },
];

jest.mock( "components/MyObservations/hooks/useIconicTaxaObservationCounts", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    counts: mockCounts,
    isLoading: false,
    refetch: jest.fn( ),
  } ),
} ) );

jest.mock( "components/MyObservations/hooks/useUnsyncedObservationIdsByIconicTaxon", ( ) => ( {
  __esModule: true,
  default: ( ) => new Map( ),
} ) );

// Stood in so these tests are about what a header tap does to collapse state and to the
// frontier, not about pagination, which useIconicTaxaSectionObservations tests on its own.
// Every section is left unactivated, which is the state a collapsed section comes back in.
const mockAdvanceFrontier = jest.fn( );
const mockActivateCategory = jest.fn( );
jest.mock( "components/MyObservations/hooks/useIconicTaxaSectionObservations", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => ( {
    sections: new Map(
      mockCounts.map( ( { category } ) => [category, {
        uuids: [],
        isActivated: false,
        isFetching: false,
        isError: false,
        hasMore: true,
      }] ),
    ),
    activateCategory: mockActivateCategory,
    advanceFrontier: mockAdvanceFrontier,
    refreshSections: jest.fn( ),
    nearingEndOfSection: jest.fn( ),
    retryCategory: jest.fn( ),
  } ) ),
} ) );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

const mockUser = factory( "LocalUser" );

// The grid pins the section a user is scrolling through, so the pinned header renders a
// second copy of the same component with the same props. Either one answers for the section.
const headerFor = category => screen.getAllByTestId(
  `MyObservationsGroupedByIconicTaxaView.Header.${category}`,
)[0];

const toggleFor = category => within( headerFor( category ) ).getByRole( "button" );

const isExpanded = category => toggleFor( category ).props.accessibilityState.expanded;

const renderGroupedView = ( ) => renderComponent(
  <MyObservationsGroupedByIconicTaxaView handlePullToRefresh={jest.fn( )} />,
);

const initialStoreState = useStore.getState( );

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  jest.clearAllMocks( );
  useStore.setState( initialStoreState, true );
  useCurrentUser.mockReturnValue( mockUser );
} );

describe( "MyObservationsGroupedByIconicTaxaView", ( ) => {
  it( "opens every section with observations", ( ) => {
    renderGroupedView( );

    expect( isExpanded( ICONIC_TAXA_GROUP.PLANTAE ) ).toBe( true );
    expect( isExpanded( ICONIC_TAXA_GROUP.AVES ) ).toBe( true );
    expect( isExpanded( ICONIC_TAXA_GROUP.INSECTA ) ).toBe( true );
  } );

  it( "closes a section when its header is tapped, and leaves the others open", async ( ) => {
    const actor = userEvent.setup( );
    renderGroupedView( );

    await actor.press( toggleFor( ICONIC_TAXA_GROUP.AVES ) );

    expect( isExpanded( ICONIC_TAXA_GROUP.AVES ) ).toBe( false );
    expect( isExpanded( ICONIC_TAXA_GROUP.PLANTAE ) ).toBe( true );
    expect( isExpanded( ICONIC_TAXA_GROUP.INSECTA ) ).toBe( true );
  } );

  it( "reopens a section when its header is tapped again", async ( ) => {
    const actor = userEvent.setup( );
    renderGroupedView( );

    await actor.press( toggleFor( ICONIC_TAXA_GROUP.AVES ) );
    await actor.press( toggleFor( ICONIC_TAXA_GROUP.AVES ) );

    expect( isExpanded( ICONIC_TAXA_GROUP.AVES ) ).toBe( true );
  } );

  it( "advances the frontier when a section is closed, so the request it frees up "
    + "goes to a section the user can still see", async ( ) => {
    const actor = userEvent.setup( );
    renderGroupedView( );

    await actor.press( toggleFor( ICONIC_TAXA_GROUP.AVES ) );

    // the set this toggle produced, not the one advanceFrontier is still holding
    expect( mockAdvanceFrontier ).toHaveBeenCalledWith(
      new Set( [ICONIC_TAXA_GROUP.AVES] ),
    );
  } );
  // Reachable once collapse state survives a remount: the section comes back closed and
  // therefore never activated, so opening it has to ask for that section by name. Advancing
  // the frontier would not do, since the frontier can be sitting above it.
  it(
    "loads the section that was reopened, so it doesn't sit empty until the user scrolls",
    async ( ) => {
      const actor = userEvent.setup( );
      renderGroupedView( );
      await actor.press( toggleFor( ICONIC_TAXA_GROUP.AVES ) );

      await actor.press( toggleFor( ICONIC_TAXA_GROUP.AVES ) );

      expect( mockActivateCategory ).toHaveBeenCalledWith( ICONIC_TAXA_GROUP.AVES );
    },
  );

  describe( "surviving the My Observations tree being torn down", ( ) => {
    // Mortal unmounts the tab navigator on blur and re-tapping the tab resets it, so leaving
    // for another tab, for the camera, or for a search and coming back all land here.
    it(
      "keeps the same sections closed when the view is unmounted and rendered again",
      async ( ) => {
        const actor = userEvent.setup( );
        const { unmount } = renderGroupedView( );
        await actor.press( toggleFor( ICONIC_TAXA_GROUP.AVES ) );
        unmount( );

        renderGroupedView( );

        expect( isExpanded( ICONIC_TAXA_GROUP.AVES ) ).toBe( false );
        expect( isExpanded( ICONIC_TAXA_GROUP.PLANTAE ) ).toBe( true );
        expect( isExpanded( ICONIC_TAXA_GROUP.INSECTA ) ).toBe( true );
      },
    );
  } );
} );
