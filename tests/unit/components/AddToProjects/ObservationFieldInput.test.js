import { screen, userEvent } from "@testing-library/react-native";
import ObservationFieldInput from "components/AddToProjects/ObservationFieldInput";
import glyphmap from "components/SharedComponents/INatIcon/glyphmap.json";
import React from "react";
import { Pressable as MockPressable, View as MockView } from "react-native";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

import {
  getObservationFieldValues,
  resetStore,
} from "./helpers/setupAddToProjects";

jest.mock( "components/SharedComponents/Sheets/PickerSheet", () => function ( { confirm } ) {
  return (
    <MockPressable
      accessibilityRole="button"
      testID="mock-picker-confirm"
      onPress={() => confirm( "Red" )}
    />
  );
} );

jest.mock( "components/SharedComponents/DateTimePicker", () => function (
  { isDateTimePickerVisible, onDatePicked },
) {
  return isDateTimePickerVisible
    ? (
      <MockPressable
        accessibilityRole="button"
        testID="mock-date-picker-confirm"
        onPress={() => onDatePicked( new Date( "2021-09-17T20:00:00" ) )}
      />
    )
    : null;
} );

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
      id: Number( id ),
    }
    : null,
  isLoading: false,
} ) );

jest.mock( "components/SharedComponents/DisplayTaxon", () => function () {
  return <MockView testID="DisplayTaxon.image" />;
} );

const actor = userEvent.setup( );
const iconGlyph = name => String.fromCharCode( glyphmap[name] );

const expectStoredOfv = ( value, obsFieldId ) => {
  expect( getObservationFieldValues( ) ).toEqual( [{
    obsFieldId,
    uuid: expect.any( String ),
    value,
    _created_at: expect.any( Date ),
    _updated_at: expect.any( Date ),
  }] );
};

describe( "ObservationFieldInput", ( ) => {
  beforeEach( ( ) => {
    resetStore( );
  } );

  it( "renders the field name", ( ) => {
    const mockPOF = factory( "LocalProjectObservationField" );
    renderComponent(
      <ObservationFieldInput projectObservationField={mockPOF} isValid />,
    );

    expect( screen.getByText( mockPOF.obsField.name ) ).toBeVisible();
  } );

  it( "shows validation passed icons for required fields", ( ) => {
    const mockPOF = factory( "LocalProjectObservationField", { required: true } );
    renderComponent(
      <ObservationFieldInput projectObservationField={mockPOF} isValid />,
    );

    expect( screen.getByText( "Required" ) ).toBeVisible( );
    expect( screen.getByText( iconGlyph( "checkmark-circle" ) ) ).toBeVisible( );
  } );

  it( "shows validation failed icons for required fields", ( ) => {
    const mockPOF = factory( "LocalProjectObservationField", { required: true } );
    renderComponent(
      <ObservationFieldInput projectObservationField={mockPOF} isValid={false} />,
    );

    expect( screen.getByText( "Required" ) ).toBeVisible( );
    expect( screen.getByText( iconGlyph( "triangle-exclamation" ) ) ).toBeVisible( );
  } );

  it( "renders a select picker when text has multiple allowed values", ( ) => {
    const mockPOF = factory( "LocalProjectObservationField" );
    renderComponent(
      <ObservationFieldInput projectObservationField={mockPOF} isValid />,
    );

    expect( screen.getByText( "Select a response" ) ).toBeVisible( );
    expect( screen.queryByPlaceholderText( "Enter a response" ) ).toBeNull( );
  } );

  describe( "store updates", ( ) => {
    it( "stores typed text for text fields", async ( ) => {
      const mockPOF = factory( "LocalProjectObservationField", {
        obsField: factory( "LocalObservationField", {
          allowedValues: "",
        } ),
      } );
      renderComponent(
        <ObservationFieldInput projectObservationField={mockPOF} isValid />,
      );

      await actor.type( screen.getByPlaceholderText( "Enter a response" ), "hello" );

      expectStoredOfv( "hello", mockPOF.obsField.id );
    } );

    it( "stores typed numbers for numeric fields", async ( ) => {
      const mockPOF = factory( "LocalProjectObservationField", {
        obsField: factory( "LocalObservationField", {
          datatype: "numeric",
        } ),
      } );
      renderComponent(
        <ObservationFieldInput projectObservationField={mockPOF} isValid />,
      );

      await actor.type( screen.getByPlaceholderText( "Enter a number" ), "42" );

      expectStoredOfv( "42", mockPOF.obsField.id );
    } );

    it( "stores the confirmed selection for select fields", async ( ) => {
      const mockPOF = factory( "LocalProjectObservationField", {
        obsField: factory( "LocalObservationField" ),
      } );
      renderComponent(
        <ObservationFieldInput
          projectObservationField={mockPOF}
          isValid
        />,
      );

      await actor.press( screen.getByText( "Select a response" ) );
      await actor.press( screen.getByTestId( "mock-picker-confirm" ) );

      expectStoredOfv( "Red", mockPOF.obsField.id );
    } );

    it( "stores a B6 date string for date fields", async ( ) => {
      const mockPOF = factory( "LocalProjectObservationField", {
        obsField: factory( "LocalObservationField", {
          datatype: "date",
        } ),
      } );
      renderComponent(
        <ObservationFieldInput projectObservationField={mockPOF} isValid />,
      );

      await actor.press( screen.getByText( "Choose a date" ) );
      await actor.press( screen.getByTestId( "mock-date-picker-confirm" ) );

      expectStoredOfv( "2021-09-17", mockPOF.obsField.id );
    } );

    it( "stores the taxon id for taxon fields", async ( ) => {
      const mockPOF = factory( "LocalProjectObservationField", {
        obsField: factory( "LocalObservationField", {
          datatype: "taxon",
        } ),
      } );
      renderComponent(
        <ObservationFieldInput projectObservationField={mockPOF} isValid />,
      );

      await actor.press( screen.getByText( "Select a species" ) );
      await actor.press( screen.getByTestId( "mock-taxon-search-select" ) );

      expectStoredOfv( "999", mockPOF.obsField.id );
    } );
  } );
} );
