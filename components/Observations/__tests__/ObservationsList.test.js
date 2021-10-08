import React from "react";
import { render } from "react-native-testing-library";
import ObservationsList from "../ObservationsList";
import ObsCard from "../ObsCard";

test( "it renders all inputs as expected", ( ) => {
  const { toJSON } = render( <ObservationsList /> );
  expect( toJSON ).toMatchSnapshot( );
} );

test( "renders text passed into observation card", ( ) => {
  const { getByTestId, getByText } = render( <ObsCard item={{
    commonName: "Insects",
    location: "SF"
  }}/> );

  expect( getByTestId( "ObservationsList.obsCard" ) ).toBeTruthy( );
  expect( getByText( "Insects" ) ).toBeTruthy( );
  expect( getByText( "SF" ) ).toBeTruthy( );
} );
