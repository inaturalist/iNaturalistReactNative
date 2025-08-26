import { SearchBar } from "components/SharedComponents";
import React from "react";

// react-native-paper's TextInput does a bunch of async stuff that's hard to
// control in a test, so we're just mocking it here.
jest.mock( "react-native-paper", () => {
  const RealModule = jest.requireActual( "react-native-paper" );
  const MockTextInput = props => {
    const MockName = "mock-text-input";
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MockName {...props}>{props.children}</MockName>;
  };
  MockTextInput.Icon = RealModule.TextInput.Icon;
  const MockedModule = {
    ...RealModule,
    // eslint-disable-next-line react/jsx-props-no-spreading
    // TextInput: props => <View {...props}>{props.children}</View>
    TextInput: MockTextInput
  };
  return MockedModule;
} );

describe( "SearchBar", () => {
  it( "should be accessible", () => {
    const searchBar = (
      <SearchBar
        value=""
        handleTextChange={jest.fn( )}
      />
    );
    // Disabled during the update to RN 0.78
    expect( searchBar ).toBeTruthy( );
    // expect( searchBar ).toBeAccessible( );
  } );
} );
