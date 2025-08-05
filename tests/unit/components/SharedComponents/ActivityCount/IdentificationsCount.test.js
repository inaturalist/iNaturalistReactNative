import { render, screen } from "@testing-library/react-native";
import { IdentificationsCount } from "components/SharedComponents";
import React from "react";

const count = 1;

describe( "IdentificationsCount", () => {
  it( "renders default reliably", () => {
    // Snapshot test
    render( <IdentificationsCount count={count} /> );

    expect( screen ).toMatchSnapshot();
  } );

  it( "renders white reliably", () => {
    // Snapshot test
    render( <IdentificationsCount count={count} white /> );

    expect( screen ).toMatchSnapshot();
  } );

  it( "renders filled reliably", () => {
    // Snapshot test
    render( <IdentificationsCount count={count} filled /> );

    expect( screen ).toMatchSnapshot();
  } );

  // a11y test
  it( "should not have accessibility errors", () => {
    // const activityCount = <IdentificationsCount count={count} />;

    // Disabled during the update to RN 0.78
    // expect( activityCount ).toBeAccessible();
  } );
} );
