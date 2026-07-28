import { screen, userEvent } from "@testing-library/react-native";
import TaxonFieldInput from "components/AddToProjects/FieldInputs/TaxonFieldInput";
import useObservationFieldValue from "components/AddToProjects/hooks/useObservationFieldValue";
import React from "react";
import { Pressable as MockPressable, View as MockView } from "react-native";
import { renderComponent } from "tests/helpers/render";

jest.mock( "components/AddToProjects/hooks/useObservationFieldValue" );

jest.mock( "components/Explore/Modals/ExploreTaxonSearchModal", () => function (
  { showModal, updateTaxon, closeModal },
) {
  return showModal
    ? (
      <MockPressable
        accessibilityRole="button"
        testID="mock-taxon-search-select"
        onPress={() => {
          updateTaxon( { id: 999 } );
          closeModal( );
        }}
      />
    )
    : null;
} );

jest.mock( "sharedHooks/useTaxon", () => ( { id } ) => ( {
  taxon: id
    ? {
      id: 999,
    }
    : null,
  isLoading: false,
} ) );

jest.mock( "components/SharedComponents/DisplayTaxon", () => function () {
  return <MockView />;
} );

const actor = userEvent.setup( );
const mockSetValue = jest.fn( );

beforeEach( ( ) => {
  mockSetValue.mockClear( );
  useObservationFieldValue.mockImplementation( () => ( {
    value: "",
    setValue: mockSetValue,
  } ) );
} );

describe( "TaxonFieldInput", ( ) => {
  it( "reads the OFV value from the hook for the given obsFieldId", ( ) => {
    renderComponent( <TaxonFieldInput obsFieldId={100} /> );

    expect( useObservationFieldValue ).toHaveBeenCalledWith( 100 );
  } );

  it( "shows placeholder when no taxon is selected", ( ) => {
    renderComponent( <TaxonFieldInput obsFieldId={100} /> );

    expect( screen.getByText( "Select a species" ) ).toBeVisible( );
  } );

  it( "calls setValue with the taxon id from species search", async ( ) => {
    renderComponent( <TaxonFieldInput obsFieldId={100} /> );

    await actor.press( screen.getByText( "Select a species" ) );
    await actor.press( screen.getByTestId( "mock-taxon-search-select" ) );

    expect( mockSetValue ).toHaveBeenCalledWith( "999" );
  } );
} );
