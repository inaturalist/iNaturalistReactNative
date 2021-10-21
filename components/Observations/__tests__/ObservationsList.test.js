import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

import ObsList from "../ObsList";
import ObsCard from "../ObsCard";

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

test( "renders text passed into observation card", ( ) => {
  const { getByTestId, getByText } = render(
    <ObsCard
      item={{
        commonName: "Insects",
        location: "SF"
      }}
    />
  );

  expect( getByTestId( "ObsList.obsCard" ) ).toBeTruthy( );
  expect( getByText( "Insects" ) ).toBeTruthy( );
  expect( getByText( "SF" ) ).toBeTruthy( );
} );
