import { screen, userEvent } from "@testing-library/react-native";
import { OBSERVATIONS_TAB, SPECIES_TAB } from "appConstants/tabs";
import ExploreSpeciesGridItem
  from "components/Explore/components/ExploreSpeciesGridItem";
import { Text } from "components/styledComponents";
import initI18next from "i18n/initI18next";
import {
  EXPLORE_PLACE_MODE,
  ExploreProvider,
  initialExploreState,
  useExplore,
} from "providers/ExploreContext";
import React from "react";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockTaxon = {
  ...factory( "RemoteTaxon" ),
  id: 745,
  name: "Silphium perfoliatum",
  preferred_common_name: "Cup Plant",
  rank_level: 10,
};

const mockedNavigate = jest.fn( );
const mockedPush = jest.fn( );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      navigate: mockedNavigate,
      getParent: () => ( {
        push: mockedPush,
      } ),
    } ),
    useRoute: () => ( { key: "test-route-key" } ),
    useNavigationState: jest.fn( ),
  };
} );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( { data: { total_results: 0 } } ),
} ) );

// Small consumer so we can observe the effect of context dispatches on the
// Explore state without reaching into implementation details.
const StateProbe = () => {
  const { state } = useExplore( );
  return (
    <>
      <Text testID="probe.subjectTaxonId">{state.subject?.taxon?.id}</Text>
      <Text testID="probe.activeTab">{state.activeTab}</Text>
    </>
  );
};

const actor = userEvent.setup( );

const renderGridItem = ( props = {}, initialState = initialExploreState ) => renderComponent(
  <ExploreProvider initialState={initialState}>
    <ExploreSpeciesGridItem taxon={mockTaxon} {...props} />
    <StateProbe />
  </ExploreProvider>,
);

beforeAll( async () => {
  await initI18next( );
} );

beforeEach( () => {
  mockedNavigate.mockClear( );
  mockedPush.mockClear( );
} );

describe( "ExploreSpeciesGridItem", () => {
  it( "renders the observation count as header text", () => {
    renderGridItem( { count: 42 } );

    expect( screen.getByText( "42 Observations" ) ).toBeTruthy( );
  } );

  it( "opens a new search for the tapped taxon, keeping the rest of the search", async () => {
    const location = { placeMode: EXPLORE_PLACE_MODE.PLACE, place: { id: 55 } };
    const filters = { ...initialExploreState.filters, casual: true };
    renderGridItem( { count: 42 }, {
      ...initialExploreState,
      location,
      sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_OLDEST,
      speciesSortBy: SPECIES_SORT.COUNT_ASC,
      filters,
      activeTab: SPECIES_TAB,
    } );

    await actor.press( screen.getByTestId( `TaxonGridItem.Pressable.${mockTaxon.id}` ) );

    expect( mockedPush ).toHaveBeenCalledWith( "Explore", {
      search: {
        subject: { type: "taxon", taxon: expect.objectContaining( { id: mockTaxon.id } ) },
        location,
        sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_OLDEST,
        speciesSortBy: SPECIES_SORT.COUNT_ASC,
        filters,
      },
      activeTab: OBSERVATIONS_TAB,
    } );
    // The current search stays as it was, for back to return to
    expect( screen.getByTestId( "probe.subjectTaxonId" ) ).toHaveTextContent( "" );
    expect( screen.getByTestId( "probe.activeTab" ) ).toHaveTextContent( "species" );
  } );

  it( "switches to the observations tab when the taxon is already the subject", async () => {
    renderGridItem( { count: 42 }, {
      ...initialExploreState,
      subject: { type: "taxon", taxon: mockTaxon },
      activeTab: SPECIES_TAB,
    } );

    await actor.press( screen.getByTestId( `TaxonGridItem.Pressable.${mockTaxon.id}` ) );

    expect( mockedPush ).not.toHaveBeenCalled( );
    expect( screen.getByTestId( "probe.activeTab" ) ).toHaveTextContent( "observations" );
  } );

  it( "navigates to TaxonDetails for the taxon when the info button is pressed", async () => {
    renderGridItem( { count: 42 } );

    await actor.press( screen.getByLabelText( "More info" ) );

    expect( mockedNavigate ).toHaveBeenCalledWith( "TaxonDetails", { id: mockTaxon.id } );
  } );

  it( "does not change the search subject when the info button is pressed", async () => {
    renderGridItem( { count: 42 } );

    await actor.press( screen.getByLabelText( "More info" ) );

    expect( screen.getByTestId( "probe.subjectTaxonId" ) ).toHaveTextContent( "" );
    expect( screen.getByTestId( "probe.activeTab" ) ).toHaveTextContent( "observations" );
  } );

  it( "omits the header text when no count is provided", () => {
    renderGridItem( );

    expect( screen.queryByText( /Observations/ ) ).toBeNull( );
  } );
} );
