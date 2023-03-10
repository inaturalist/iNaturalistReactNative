import { render, screen } from "@testing-library/react-native";
import { CommentsCount } from "components/SharedComponents";
import initI18next from "i18n/initI18next";
import React from "react";

const count = 1;

describe( "CommentsCount", () => {
  beforeAll( async () => {
    await initI18next();
  } );

  it( "renders default reliably", () => {
    // Snapshot test
    render( <CommentsCount count={count} /> );

    expect( screen ).toMatchSnapshot();
  } );

  it( "renders white reliably", () => {
    // Snapshot test
    render( <CommentsCount count={count} white /> );

    expect( screen ).toMatchSnapshot();
  } );

  it( "renders filled reliably", () => {
    // Snapshot test
    render( <CommentsCount count={count} filled /> );

    expect( screen ).toMatchSnapshot();
  } );

  // a11y test
  it( "should not have accessibility errors", () => {
    const activityCount = <CommentsCount count={count} />;

    expect( activityCount ).toBeAccessible();
  } );
} );
