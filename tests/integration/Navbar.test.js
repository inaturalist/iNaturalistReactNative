import { createDrawerNavigator } from "@react-navigation/drawer";
import { useRoute } from "@react-navigation/native";
import { screen } from "@testing-library/react-native";
import NavBar from "components/SharedComponents/NavBar/NavBar";
import React from "react";
import { Text } from "react-native";

import { renderComponent } from "../helpers/render";

const Drawer = createDrawerNavigator( );

/* eslint-disable i18next/no-literal-string */
const TestObsList = ( ): React.Node => (
  <>
    <Text>Obs List</Text>
    <NavBar />
  </>
);

const TestMessages = ( ): React.Node => (
  <>
    <Text>Messages</Text>
    <NavBar />
  </>
);

describe( "NavBar", () => {
  it( "handles active pages correctly", async () => {
    useRoute.mockReturnValue( { name: "ObsList" } );
    renderComponent(
      <Drawer.Navigator>
        <Drawer.Screen name="ObsList" component={TestObsList} />
        <Drawer.Screen name="Messages" component={TestMessages} />
      </Drawer.Navigator>
    );

    const navToObsList = screen.getByTestId( "ObsList" );
    expect( navToObsList ).toHaveAccessibilityState( {
      busy: false,
      disabled: false,
      expanded: true,
      selected: true
    } );
    const navToMessages = screen.getByTestId( "Messages" );
    expect( navToMessages ).toHaveAccessibilityState( {
      busy: false,
      disabled: false,
      expanded: false,
      selected: false
    } );
    expect( screen.getByText( "Obs List" ) ).toBeTruthy();
  } );
} );
