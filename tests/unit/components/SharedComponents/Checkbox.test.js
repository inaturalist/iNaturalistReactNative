import { fireEvent, render, screen } from "@testing-library/react-native";
import { Checkbox } from "components/SharedComponents";
import React from "react";
import colors from "styles/tailwindColors";
import { renderComponent } from "tests/helpers/render";

const rerenderCheckmarkComponent = checked => {
  renderComponent(
    <Checkbox
      accessibilityLabel="Checkmark"
      text="Checkmark text"
      isChecked={checked}
    />,
  );
  const checkbox = screen.getByLabelText( /Checkmark/ );
  expect( checkbox ).toHaveProp( "innerIconStyle", {
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.inatGreen,
  } );
};

describe( "Checkbox", () => {
  it( "renders reliably", () => {
    render( <Checkbox text="Checkmark text" /> );

    // Disabled during the update to RN 0.78
    // expect( screen ).toMatchSnapshot();
  } );

  it( "renders reliably being checked", () => {
    render( <Checkbox text="Checkmark text" isChecked /> );

    // Disabled during the update to RN 0.78
    // expect( screen ).toMatchSnapshot();
  } );

  it( "has no accessibility errors", () => {
    // const checkbox = <Checkbox accessibilityLabel="Checkmark" text="Checkmark text" isChecked />;

    // Disabled during the update to RN 0.78
    // expect( checkbox ).toBeAccessible();
  } );

  it( "renders an empty checkbox when isChecked is false", () => {
    renderComponent(
      <Checkbox
        accessibilityLabel="Checkmark"
        text="Checkmark text"
        isChecked={false}
      />,
    );

    const checkmark = screen.getByLabelText( /Checkmark/ );

    expect( checkmark ).toBeTruthy( );
    expect( checkmark ).toHaveProp( "innerIconStyle", {
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.darkGray,
    } );
  } );

  it( "renders a green filled checkbox when isChecked is true", () => {
    renderComponent( <Checkbox accessibilityLabel="Checkmark" text="Checkmark text" isChecked /> );

    const checkmark = screen.getByLabelText( /Checkmark/ );
    expect( checkmark ).toHaveProp( "innerIconStyle", {
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.inatGreen,
    } );
  } );

  it( "changes value when user presses checkbox being not checked", () => {
    let checked = false;
    renderComponent(
      <Checkbox
        accessibilityLabel="Checkmark"
        text="Checkmark text"
        isChecked={checked}
        // eslint-disable-next-line no-return-assign
        onPress={( ) => ( checked = !checked )}
      />,
    );
    const checkmark = screen.getByLabelText( /Checkmark/ );

    expect( checked ).toBeFalsy( );
    fireEvent.press( checkmark );
    expect( checked ).toBeTruthy( );
    rerenderCheckmarkComponent( checked );
  } );

  it( "changes value when user presses checkbox being checked", () => {
    let checked = true;
    renderComponent(
      <Checkbox
        accessibilityLabel="Checkmark"
        text="Checkmark text"
        isChecked={checked}
        onPress={( ) => { checked = !checked; }}
      />,
    );
    const checkmark = screen.getByLabelText( /Checkmark/ );

    expect( checked ).toBeTruthy( );
    fireEvent.press( checkmark );
    expect( checked ).toBeFalsy( );
  } );

  it( "renders text and changes value when user presses text", () => {
    let checked = false;
    renderComponent(
      <Checkbox
        text="Checkmark text"
        isChecked={checked}
        onPress={( ) => { checked = !checked; }}
      />,
    );

    const text = screen.getByText( /Checkmark text/ );
    expect( text ).toBeVisible( );
    expect( checked ).toBeFalsy( );
    fireEvent.press( text );
    expect( checked ).toBeTruthy( );
    rerenderCheckmarkComponent( checked );
  } );
} );
