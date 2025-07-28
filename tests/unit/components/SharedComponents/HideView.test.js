import { render, screen } from "@testing-library/react-native";
import HideView from "components/SharedComponents/HideView.tsx";
import React, { useEffect } from "react";
import { Text } from "react-native";

const testFunc = jest.fn();

const TEST_TEXT = "Centipedes";

const TestComponent = () => {
  useEffect( () => {
    testFunc();
  }, [] );

  return <Text>{TEST_TEXT}</Text>;
};

describe( "HideView", () => {
  afterEach( () => {
    jest.clearAllMocks();
  } );

  test( "should show component correctly", () => {
    render(
      <HideView show>
        <TestComponent />
      </HideView>
    );

    expect( testFunc ).toHaveBeenCalledTimes( 1 );

    expect( screen.queryByText( TEST_TEXT ) ).toBeVisible();
  } );

  test( "should hide component correctly", () => {
    render(
      <HideView show={false}>
        <TestComponent />
      </HideView>
    );

    expect( testFunc ).toHaveBeenCalledTimes( 1 );
    expect(
      screen.queryByText( TEST_TEXT, { includeHiddenElements: true } )
    ).not.toBeVisible();
  } );

  test( "should not render hidden component", () => {
    render(
      <HideView show={false} noInitialRender>
        <TestComponent />
      </HideView>
    );

    expect( testFunc ).not.toHaveBeenCalled();
    expect( screen.queryByText( TEST_TEXT ) ).not.toBeTruthy();
  } );
} );
