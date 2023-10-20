import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import NavButton from "navigation/BottomTabNavigator/NavButton";
import React from "react";

import { renderComponent } from "../../../helpers/render";

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useFocusEffect: ( ) => jest.fn( )
  };
} );

describe( "NavButton", () => {
  it( "should render person icon if user is logged out", () => {
    renderComponent( <NavButton
      userIconUri={undefined}
      accessibilityLabel="Observations"
      testID="NavButton.personIcon"
    /> );

    const personIcon = screen.getByTestId( "NavButton.personIcon" );
    expect( personIcon ).toBeVisible( );
  } );

  it( "should render avatar if user is logged in", () => {
    renderComponent( <NavButton
      userIconUri={faker.image.imageUrl( )}
      accessibilityLabel="Observations"
      testID="NavButton.avatar"
    /> );

    const avatar = screen.getByTestId( "UserIcon.photo" );
    expect( avatar ).toBeVisible( );
  } );
} );
