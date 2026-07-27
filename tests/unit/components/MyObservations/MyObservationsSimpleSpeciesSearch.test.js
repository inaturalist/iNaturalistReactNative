import { screen, userEvent, within } from "@testing-library/react-native";
import MyObservationsSimple, { OBSERVATIONS_TAB, TAXA_TAB }
  from "components/MyObservations/MyObservationsSimple";
import initI18next from "i18n/initI18next";
import { MyObservationsProvider } from "providers/MyObservationsContext";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockTaxon = factory( "RemoteTaxon", {
  id: 123,
  name: "Calidris alba",
  preferred_common_name: "Sanderling",
} );

const mockSpeciesCounts = [{ count: 3, taxon: mockTaxon }];

let mockSearchEnabled = false;

jest.mock( "sharedHooks/useFeatureFlag", ( ) => ( {
  __esModule: true,
  default: jest.fn( flag => ( flag === "searchMyObservationsEnabled"
    ? mockSearchEnabled
    : false ) ),
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

const renderSpeciesTab = ( {
  taxa = mockSpeciesCounts,
  showSpeciesSearchEmptyState = false,
} = {} ) => renderComponent(
  <MyObservationsProvider>
    <MyObservationsSimple
      activeTab={TAXA_TAB}
      observationIds={[]}
      onEndReached={jest.fn( )}
      updateObservationsView={jest.fn( )}
      setActiveTab={mockSetActiveTab}
      taxa={taxa}
      showSpeciesSearchEmptyState={showSpeciesSearchEmptyState}
      fetchMoreTaxa={jest.fn( )}
      refetchTaxa={jest.fn( )}
    />
  </MyObservationsProvider>,
);

const actor = userEvent.setup( );

beforeAll( async ( ) => {
  await initI18next( );
  jest.useFakeTimers( );
} );

beforeEach( ( ) => {
  mockSearchEnabled = false;
  mockedNavigate.mockClear( );
  mockSetActiveTab.mockClear( );
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

  describe( "when the search feature flag is enabled", ( ) => {
    beforeEach( ( ) => {
      mockSearchEnabled = true;
    } );

    it( "searches the taxon and switches to the observations tab when a "
      + "species card is pressed", async ( ) => {
      renderSpeciesTab( );

      await actor.press( screen.getByTestId( "SimpleTaxonGridItem" ) );

      expect( mockSetActiveTab ).toHaveBeenCalledWith( OBSERVATIONS_TAB );
      expect( mockedNavigate ).not.toHaveBeenCalled( );

      const banner = screen.getByTestId( "SearchedTaxonBanner" );
      expect( within( banner ).getByText( "Sanderling" ) ).toBeTruthy( );
    } );

    it( "navigates to taxon details without searching when the info icon is "
      + "pressed", async ( ) => {
      renderSpeciesTab( );

      await actor.press( screen.getByTestId( "SimpleTaxonGridItem.infoButton" ) );

      expect( mockedNavigate ).toHaveBeenCalledWith( expect.objectContaining( {
        name: "TaxonDetails",
        params: { id: mockTaxon.id },
      } ) );
      expect( mockSetActiveTab ).not.toHaveBeenCalled( );
    } );
  } );

  describe( "when the search feature flag is disabled", ( ) => {
    it( "navigates to taxon details when a species card is pressed", async ( ) => {
      renderSpeciesTab( );

      await actor.press( screen.getByTestId( "SimpleTaxonGridItem" ) );

      expect( mockedNavigate ).toHaveBeenCalledWith( expect.objectContaining( {
        name: "TaxonDetails",
        params: { id: mockTaxon.id },
      } ) );
      expect( mockSetActiveTab ).not.toHaveBeenCalled( );
    } );

    it( "does not render the info icon button", ( ) => {
      renderSpeciesTab( );

      expect( screen.queryByTestId( "SimpleTaxonGridItem.infoButton" ) ).toBeNull( );
    } );
  } );
} );
