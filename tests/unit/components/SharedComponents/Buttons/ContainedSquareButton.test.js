import { fireEvent, render, screen } from "@testing-library/react-native";
import ContainedSquareButton from "components/SharedComponents/Buttons/ContainedSquareButton";
import React from "react";
import colors from "styles/tailwindColors";

const renderButton = ( props = {} ) => render(
  <ContainedSquareButton
    icon="magnifying-glass"
    backgroundColor={colors.inatGreen}
    accessibilityLabel="Search"
    onPress={() => {}}
    {...props}
  />,
);

describe( "ContainedSquareButton", () => {
  it( "renders correctly", () => {
    renderButton();
    expect( screen ).toMatchSnapshot();
  } );

  it( "calls onPress when pressed", () => {
    const onPress = jest.fn();
    renderButton( { onPress } );
    fireEvent.press( screen.getByLabelText( "Search" ) );
    expect( onPress ).toHaveBeenCalled();
  } );

  it( "does not call onPress when disabled", () => {
    const onPress = jest.fn();
    renderButton( { disabled: true, onPress } );
    fireEvent.press( screen.getByLabelText( "Search" ) );
    expect( onPress ).not.toHaveBeenCalled();
  } );
} );
