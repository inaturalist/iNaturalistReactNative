import React from "react";
import { FlatList } from "react-native";
import { fireEvent, render, act } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import ObsList from "../ObsList";
import EmptyList from "../EmptyList";

test( "it renders all inputs as expected", ( ) => {
  const { toJSON } = render(
    // need nav container here so the useNavigation hook in Footer does not fail
    // not sure if there's a better way of doing this without needing to wrap every test
    // https://www.reactnativeschool.com/setup-jest-tests-with-react-navigation
    <NavigationContainer>
      <ObsList />
    </NavigationContainer>
  );
  expect( toJSON ).toMatchSnapshot( );
} );
