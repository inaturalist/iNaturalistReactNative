import { render, screen } from "@testing-library/react-native";
import { PhotoCount } from "components/SharedComponents";
import React from "react";

describe( "PhotoCount", () => {
  it( "renders correctly", () => {
    render( <PhotoCount count={7} /> );

    expect( screen ).toMatchSnapshot();
  } );

  describe( "when photo count equal to 0", () => {
    it( "should not render", () => {
      render( <PhotoCount count={0} /> );

      const photoCount = screen.queryByTestId( "photo-count" );

      expect( photoCount ).toBeNull();
    } );
  } );

  describe( "when photo count is greater than 0", () => {
    describe( "when photo count is greater than 100", () => {
      it( "renders photo count value equal to 99", () => {
        render( <PhotoCount count={200} /> );

        const photoCountValue = screen.getByText( "99" );

        expect( photoCountValue ).toBeTruthy();
      } );
    } );

    describe( "when photo count is less than 100", () => {
      it( "renders the default photo count value", () => {
        render( <PhotoCount count={14} /> );

        const photoCountValue = screen.getByText( "14" );

        expect( photoCountValue ).toBeTruthy();
      } );
    } );
  } );
} );
