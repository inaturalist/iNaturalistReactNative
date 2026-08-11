import { fireEvent, screen } from "@testing-library/react-native";
import FilterModal from "components/Explore/Modals/FilterModal";
import { ExploreProvider } from "providers/ExploreContext";
import React from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { renderComponent } from "tests/helpers/render";

const mockCloseModal = jest.fn( );
const mockUpdateTaxon = jest.fn( );

const renderFilterModal = ( ) => renderComponent(
  <ExploreProvider>
    <FilterModal
      closeModal={mockCloseModal}
      updateTaxon={mockUpdateTaxon}
    />
  </ExploreProvider>,
);

const chooseExactDate = async ( filterLabel, pickedDate ) => {
  fireEvent.press( await screen.findByLabelText( filterLabel ) );
  fireEvent.press( await screen.findByText( "Exact Date" ) );
  fireEvent.press( screen.getByText( "CONFIRM" ) );
  await screen.findByLabelText( "Change date" );

  const datePickers = screen.UNSAFE_getAllByType( DateTimePickerModal );
  expect( datePickers.length ).toEqual( 1 );
  fireEvent( datePickers[0], "onConfirm", pickedDate );
};

describe( "FilterModal", () => {
  test( "should not have accessibility errors", async () => {
    renderFilterModal( );

    const filterModal = await screen.findByTestId( "filter-modal" );
    // TODO: this errors because RadioButton from react-native-paper is not accessible
    console.log( "typeof filterModal :>> ", typeof filterModal );
    // expect( filterModal ).toBeAccessible();
  } );

  describe( "in Europe/Berlin", ( ) => {
    // Berlin is already Feb 14 while UTC is still Feb 13
    const picked = new Date( "2026-02-13T23:30:00Z" );
    let resolvedOptionsSpy;

    beforeAll( ( ) => {
      resolvedOptionsSpy = jest.spyOn(
        Intl.DateTimeFormat.prototype,
        "resolvedOptions",
      ).mockReturnValue( {
        calendar: "gregory",
        locale: "en-US",
        numberingSystem: "latn",
        timeZone: "Europe/Berlin",
      } );
    } );

    afterAll( ( ) => {
      resolvedOptionsSpy.mockRestore( );
    } );

    it( "filters on the date observed on the device, not the UTC date", async ( ) => {
      renderFilterModal( );

      await chooseExactDate( "Date observed", picked );

      expect( await screen.findByText( "2026-02-14" ) ).toBeVisible( );
    } );

    it( "filters on the date uploaded on the device, not the UTC date", async ( ) => {
      renderFilterModal( );

      await chooseExactDate( "Date uploaded", picked );

      expect( await screen.findByText( "2026-02-14" ) ).toBeVisible( );
    } );
  } );
} );
