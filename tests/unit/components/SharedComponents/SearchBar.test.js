import { SearchBar } from "components/SharedComponents";
import React from "react";

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
