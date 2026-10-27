import { screen, userEvent, within } from "@testing-library/react-native";
import { ACTIVE_SHEET } from "components/MyObservations/MyObservationsResults";
import MyObservationsSimple, { OBSERVATIONS_TAB, TAXA_TAB }
  from "components/MyObservations/MyObservationsSimple";
import initI18next from "i18n/initI18next";
import React from "react";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockTaxon = factory( "RemoteTaxon", {
  id: 123,
  name: "Calidris alba",
  preferred_common_name: "Sanderling",
} );

const mockSpeciesCounts = [{ count: 3, taxon: mockTaxon }];

const mockCurrentUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useFeatureFlag", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => false ),
} ) );

const mockedNavigate = jest.fn( );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( { navigate: mockedNavigate } ),
    useRoute: ( ) => ( { key: "test-route-key" } ),
  };
} );

const mockSetActiveTab = jest.fn( );
const mockSetSpeciesSortOptionId = jest.fn( );

const renderSpeciesTab = ( {
  currentUser = undefined,
  isConnected = true,
  isLoadingTaxa = false,
  taxa = mockSpeciesCounts,
  showSpeciesSearchEmptyState = false,
  speciesSortOptionId = SPECIES_SORT.COUNT_DESC,
  openSheet = ACTIVE_SHEET.NONE,
} = {} ) => renderComponent(
  <MyObservationsSimple
    activeTab={TAXA_TAB}
    currentUser={currentUser}
    isConnected={isConnected}
    isLoadingTaxa={isLoadingTaxa}
    observationIds={[]}
    onEndReached={jest.fn( )}
    updateObservationsView={jest.fn( )}
    setActiveTab={mockSetActiveTab}
    taxa={taxa}
    showSpeciesSearchEmptyState={showSpeciesSearchEmptyState}
    fetchMoreTaxa={jest.fn( )}
    refetchTaxa={jest.fn( )}
    speciesSortOptionId={speciesSortOptionId}
    setSpeciesSortOptionId={mockSetSpeciesSortOptionId}
    openSheet={openSheet}
    setOpenSheet={jest.fn( )}
  />,
);

const initialStoreState = useStore.getState( );

const actor = userEvent.setup( );

beforeAll( async ( ) => {
  await initI18next( );
  jest.useFakeTimers( );
} );

beforeEach( ( ) => {
  useStore.setState( initialStoreState, true );
  mockedNavigate.mockClear( );
  mockSetActiveTab.mockClear( );
  mockSetSpeciesSortOptionId.mockClear( );
} );

describe( "MyObservationsSimple species tab", ( ) => {
  it( "renders a species card for each taxon", ( ) => {
    renderSpeciesTab( );

    expect( screen.getByText( "Sanderling" ) ).toBeTruthy( );
  } );

  it( "renders SearchEmptyState when a species search has no results", ( ) => {
    renderSpeciesTab( { taxa: [], showSpeciesSearchEmptyState: true } );

    expect( screen.getByTestId( "MyObservationsSearchEmptyState.reset" ) ).toBeTruthy( );
  } );

  it( "renders the offline notice instead of SearchEmptyState when offline", ( ) => {
    renderSpeciesTab( {
      taxa: [],
      showSpeciesSearchEmptyState: false,
      isConnected: false,
    } );

    expect( screen.getByText( "You are offline. Tap to try again." ) ).toBeTruthy( );
    expect( screen.queryByTestId( "MyObservationsSearchEmptyState.reset" ) ).toBeNull( );
  } );

  it( "renders an activity indicator while the species list loads", ( ) => {
    renderSpeciesTab( { taxa: [], isLoadingTaxa: true } );

    expect( screen.getByTestId( "FullScreenActivityIndicator" ) ).toBeVisible( );
  } );

  it( "renders the offline notice instead of an activity indicator when offline", ( ) => {
    renderSpeciesTab( { taxa: [], isLoadingTaxa: true, isConnected: false } );

    expect( screen.getByText( "You are offline. Tap to try again." ) ).toBeVisible( );
    expect( screen.queryByTestId( "FullScreenActivityIndicator" ) ).toBeNull( );
  } );

  describe( "when signed in", ( ) => {
    it( "searches the taxon and switches to the observations tab when a "
      + "species card is pressed", async ( ) => {
      renderSpeciesTab( { currentUser: mockCurrentUser } );

      await actor.press( screen.getByTestId( "SimpleTaxonGridItem" ) );

      expect( mockSetActiveTab ).toHaveBeenCalledWith( OBSERVATIONS_TAB );
      expect( mockedNavigate ).not.toHaveBeenCalled( );

      const banner = screen.getByTestId( "SearchedTaxonBanner" );
      expect( within( banner ).getByText( "Sanderling" ) ).toBeTruthy( );
    } );

    it( "navigates to taxon details without searching when the info icon is "
      + "pressed", async ( ) => {
      renderSpeciesTab( { currentUser: mockCurrentUser } );

      await actor.press( screen.getByTestId( "SimpleTaxonGridItem.infoButton" ) );

      expect( mockedNavigate ).toHaveBeenCalledWith( expect.objectContaining( {
        name: "TaxonDetails",
        params: { id: mockTaxon.id },
      } ) );
      expect( mockSetActiveTab ).not.toHaveBeenCalled( );
    } );
  } );

  describe( "when signed out", ( ) => {
    it( "navigates to taxon details instead of searching when a species "
      + "card is pressed", async ( ) => {
      renderSpeciesTab( { currentUser: undefined } );

      await actor.press( screen.getByTestId( "SimpleTaxonGridItem" ) );

      expect( mockedNavigate ).toHaveBeenCalledWith( expect.objectContaining( {
        name: "TaxonDetails",
        params: { id: mockTaxon.id },
      } ) );
      expect( mockSetActiveTab ).not.toHaveBeenCalled( );
    } );

    it( "does not render the info icon button", ( ) => {
      renderSpeciesTab( { currentUser: undefined } );

      expect( screen.queryByTestId( "SimpleTaxonGridItem.infoButton" ) ).toBeNull( );
    } );
  } );

  it( "offers date observed sorts and applies the one chosen", async ( ) => {
    renderSpeciesTab( { openSheet: ACTIVE_SHEET.SORT } );

    expect( screen.getByText( "Date Observed: Newest" ) ).toBeVisible( );
    expect( screen.getByText( "Species observed recently appear first" ) ).toBeVisible( );
    expect( screen.getByText( "Date Observed: Oldest" ) ).toBeVisible( );
    expect( screen.getByText( "Species observed least recently appear first" ) ).toBeVisible( );

    await actor.press( screen.getByText( "Date Observed: Newest" ) );
    await actor.press( screen.getByText( "CONFIRM" ) );

    expect( mockSetSpeciesSortOptionId ).toHaveBeenCalledWith( SPECIES_SORT.DATE_OBSERVED_NEWEST );
  } );
} );
