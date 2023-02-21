import { render } from "@testing-library/react-native";
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
    // TODO: Enable when icon is in font
    // expect( screen ).toMatchSnapshot();
  } );

  it( "renders white reliably", () => {
    // Snapshot test
    render( <CommentsCount count={count} white /> );
    // TODO: Enable when icon is in font
    // expect( screen ).toMatchSnapshot();
  } );

  it( "renders filled reliably", () => {
    // Snapshot test
    render( <CommentsCount count={count} filled /> );
    // TODO: Enable when icon is in font
    // expect( screen ).toMatchSnapshot();
  } );

  // a11y test
  it( "should not have accessibility errors", () => {
    const activityCount = <CommentsCount count={count} />;

    expect( activityCount ).toBeAccessible();
  } );
} );
