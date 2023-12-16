import { BackButton } from "components/SharedComponents";
import React from "react";

describe( "BackButton", () => {
  it( "has no accessibility errors", () => {
    const button = <BackButton />;

    expect( button ).toBeAccessible();
  } );
} );
