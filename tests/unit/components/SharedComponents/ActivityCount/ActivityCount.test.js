import { render, screen } from "@testing-library/react-native";
import { ActivityCount } from "components/SharedComponents";
import initI18next from "i18n/initI18next";
import React from "react";

const count = 1;
const icon = "comments-filled-in";
const testID = "some_id";

describe( "ActivityCount", () => {
  beforeAll( async () => {
    await initI18next();
  } );

  it( "renders reliably", () => {
    // Snapshot test
    render( <ActivityCount count={count} icon={icon} testID={testID} /> );

    expect( screen ).toMatchSnapshot();
  } );

  // a11y test
  it( "should not have accessibility errors", () => {
    const activityCount = (
      <ActivityCount count={count} icon={icon} testID={testID} />
    );

    expect( activityCount ).toBeAccessible();
  } );
} );
