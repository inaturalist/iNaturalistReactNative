import { createDrawerNavigator } from "@react-navigation/drawer";
import { useRoute } from "@react-navigation/native";
import NavBar from "components/SharedComponents/NavBar/NavBar";
import React from "react";
import { Text } from "react-native";

import { renderComponent } from "../../../helpers/render";

const Drawer = createDrawerNavigator( );

/* eslint-disable i18next/no-literal-string */
const TestObsList = ( ): React.Node => (
  <>
    <Text>ObsList</Text>
    <NavBar />
  </>
);
describe( "NavBar", ( ) => {
  it( "handles active pages correctly", async ( ) => {
    useRoute.mockReturnValueOnce( { name: "ObsList" } );
    const { getByTestId } = renderComponent(
      <Drawer.Navigator>
        <Drawer.Screen name="ObsList" component={TestObsList} />
      </Drawer.Navigator>
    );

    const navToObsList = getByTestId( "ObsList" );
    expect( navToObsList ).toHaveAccessibilityState(
      { selected: true, expanded: true, disabled: true }
    );
  } );
} );
