import { render, screen } from "@testing-library/react-native";
import ContainedSquareButton from "components/SharedComponents/Buttons/ContainedSquareButton";
import React from "react";
import colors from "styles/tailwindColors";

describe( "ContainedSquareButton", () => {
  it( "renders correctly", () => {
    render(
      <ContainedSquareButton
        icon="magnifying-glass"
        backgroundColor={colors.inatGreen}
        accessibilityLabel="Search"
        onPress={() => {}}
      />,
    );
    expect( screen ).toMatchSnapshot();
  } );
} );
