import { render, screen } from "@testing-library/react-native";
import { ActivityCount } from "components/SharedComponents";
import React from "react";

const count = 1;
const icon = "comments";
const testID = "some_id";

describe( "ActivityCount", () => {
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
    // const activityCount = (
    //   <ActivityCount count={count} icon={icon} testID={testID} />
    // );

    // Disabled during the update to RN 0.78
    // expect( activityCount ).toBeAccessible();
  } );
} );
