import text from "@nozbe/watermelondb/decorators/text";
import React from "react";
import { render } from "react-native-testing-library";
import ObservationsList from "../ObservationsList";

test( "it renders all inputs as expected", ( ) => {
  const { toJSON } = render( <ObservationsList /> );
  expect( toJSON ).toMatchSnapshot( );
} );

text( "displays empty message if user has no observations", ( ) => {
  const { getByTestId } = render( <ObservationsList /> );
  console.log( getByTestId( "ObservationsList.emptyList" ).props );
} );
