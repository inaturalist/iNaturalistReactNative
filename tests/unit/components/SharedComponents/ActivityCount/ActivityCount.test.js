import { render, screen } from "@testing-library/react-native";
import { ActivityCount } from "components/SharedComponents";
import initI18next from "i18n/initI18next";
import React from "react";

const count = 1;
const icon = "comments";
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

  it( "displays the count parameter as text", () => {
    render( <ActivityCount count={count} icon={icon} testID={testID} /> );

    const activityCount = screen.getByText( count.toString() );
    expect( activityCount ).toBeTruthy();
  } );

  // a11y test
  it( "should not have accessibility errors", () => {
    const activityCount = (
      <ActivityCount count={count} icon={icon} testID={testID} />
    );

    expect( activityCount ).toBeAccessible();
  } );
} );
