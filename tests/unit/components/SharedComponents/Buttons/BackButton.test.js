import { BackButton } from "components/SharedComponents";
import React from "react";
import { View } from "react-native";
import { wrapInNavigationContainer } from "tests/helpers/render";

// eslint-disable-next-line i18next/no-literal-string
const mockHeaderBackButton = <View testID="ObsEdit.BackButton">Mocked Back</View>;

// Note: HeaderBackButton has accessibility issues
jest.mock( "@react-navigation/elements", () => ( {
  ...jest.requireActual( "@react-navigation/elements" ),
  HeaderBackButton: jest.fn()
    .mockImplementation( ( ) => mockHeaderBackButton )
} ) );

describe( "BackButton", () => {
  it( "has no accessibility errors", () => {
    const button = wrapInNavigationContainer( <BackButton /> );

    expect( button ).toBeAccessible();
  } );
} );
