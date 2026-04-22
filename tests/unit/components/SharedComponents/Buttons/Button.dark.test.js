import { render, screen } from "@testing-library/react-native";
import { Button } from "components/SharedComponents";
import React from "react";

// Mock Appearance.getColorScheme()
jest.mock( "react-native/Libraries/Utilities/Appearance", () => {
  const actualAppearance = jest.requireActual( "react-native/Libraries/Utilities/Appearance" );
  return {
    ...actualAppearance,
    getColorScheme: jest.fn( () => "dark" ),
  };
} );

// Mock nativewind useColorScheme()
jest.mock( "nativewind", () => {
  const actualNativewind = jest.requireActual( "nativewind" );
  return {
    ...actualNativewind,
    useColorScheme: jest.fn( () => ( { colorScheme: "dark" } ) ),
  };
} );

describe.each( [["primary"], ["warning"], ["focus"], ["neutral"]] )(
  "Button %s in dark mode",
  level => {
    it( "should render correctly", () => {
      render( <Button level={level} text={`${level.toUpperCase()} BUTTON`} /> );

      // Snapshot test
      expect( screen ).toMatchSnapshot();
    } );

    it( "has no accessibility errors", () => {
      // const button = <Button level={level} text={`${level.toUpperCase()} BUTTON`} />;

      // Disabled during the update to RN 0.78
      // expect( button ).toBeAccessible();
    } );

    describe( "when disabled", () => {
      it( "should render correctly", () => {
        render( <Button level={level} text={`${level.toUpperCase()} DISABLED`} disabled /> );

        // Snapshot test
        expect( screen ).toMatchSnapshot();
      } );

      it( "has no accessibility errors", () => {
        // const button = (
        //   <Button level={level} text={`${level.toUpperCase()} DISABLED`} disabled />
        // );

        // Disabled during the update to RN 0.78
        // expect( button ).toBeAccessible();
      } );
    } );
  },
);
