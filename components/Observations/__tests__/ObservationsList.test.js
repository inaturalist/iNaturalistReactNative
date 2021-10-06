import React from "react";
import { render } from "react-native-testing-library";
import ObservationsList from "../ObservationsList";

test( "it renders all inputs as expected", ( ) => {
  const { toJSON } = render( <ObservationsList /> );
  expect( toJSON ).toMatchSnapshot( );
} );

test( "displays empty message if user has no observations", ( ) => {
  const { getByTestId } = render( <ObservationsList /> );

  const text = "no observations";
  const { children } = getByTestId( "ObservationsList.emptyList" ).props;
  console.log( getByTestId( "ObservationsList.myObservations" ).props.data.length );
} );
