import { screen, userEvent } from "@testing-library/react-native";
import ExploreV2SpeciesGridItem
  from "components/Explore/ExploreV2/components/ExploreV2SpeciesGridItem";
import { Text } from "components/styledComponents";
import initI18next from "i18n/initI18next";
import { ExploreV2Provider, useExploreV2 } from "providers/ExploreV2Context";
import React from "react";
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

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: () => ( {
      navigate: mockedNavigate,
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
// ExploreV2 state without reaching into implementation details.
const StateProbe = () => {
  const { state } = useExploreV2( );
  return (
    <>
      <Text testID="probe.subjectTaxonId">{state.subject?.taxon?.id}</Text>
      <Text testID="probe.activeTab">{state.activeTab}</Text>
    </>
  );
};

const actor = userEvent.setup( );

const renderGridItem = ( props = {} ) => renderComponent(
  <ExploreV2Provider>
    <ExploreV2SpeciesGridItem taxon={mockTaxon} {...props} />
    <StateProbe />
  </ExploreV2Provider>,
);

beforeAll( async () => {
  await initI18next( );
} );

beforeEach( () => {
  mockedNavigate.mockClear( );
} );

describe( "ExploreV2SpeciesGridItem", () => {
  it( "renders the observation count as header text", () => {
    renderGridItem( { count: 42 } );

    expect( screen.getByText( "42 Observations" ) ).toBeTruthy( );
  } );

  it( "sets the tapped taxon as the search subject when the card is pressed", async () => {
    renderGridItem( { count: 42 } );

    await actor.press( screen.getByTestId( `TaxonGridItem.Pressable.${mockTaxon.id}` ) );

    expect( screen.getByTestId( "probe.subjectTaxonId" ) ).toHaveTextContent(
      String( mockTaxon.id ),
    );
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
