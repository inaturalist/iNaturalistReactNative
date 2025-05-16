import { BackButton } from "components/SharedComponents";
import React from "react";
import { wrapInNavigationContainer } from "tests/helpers/render";

// Note: HeaderBackButton has accessibility issues
jest.mock( "@react-navigation/elements" );

describe( "BackButton", () => {
  it( "has no accessibility errors", () => {
    const button = wrapInNavigationContainer( <BackButton /> );

    expect( button ).toBeAccessible();
  } );
} );
