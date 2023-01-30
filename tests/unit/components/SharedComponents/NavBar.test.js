import { createDrawerNavigator } from "@react-navigation/drawer";
import { useRoute } from "@react-navigation/native";
import { screen } from "@testing-library/react-native";
import NavBar from "components/SharedComponents/NavBar/NavBar";
import React from "react";
import { Text } from "react-native";

import { renderComponent } from "../../../helpers/render";

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

describe( "NavBar", ( ) => {
  it( "handles active pages correctly", async ( ) => {
    useRoute.mockReturnValueOnce( { name: "ObsList" } );
    renderComponent(
      <Drawer.Navigator>
        <Drawer.Screen name="ObsList" component={TestObsList} />
        <Drawer.Screen name="Messages" component={TestMessages} />
      </Drawer.Navigator>
    );

    const navToObsList = screen.getByTestId( "ObsList" );
    expect( navToObsList ).toHaveAccessibilityState(
      { selected: true, expanded: true, disabled: true }
    );
    const navToMessages = screen.getByTestId( "Messages" );
    expect( navToMessages ).toHaveAccessibilityState(
      { selected: false, expanded: false, disabled: false }
    );
    expect( screen.getByText( "Obs List" ) ).toBeTruthy();
  } );
} );
