import { render, screen } from "@testing-library/react-native";
import { UploadStatus } from "components/SharedComponents";
import React from "react";

jest.mock( "react-native-circular-progress-indicator", () => "CircularProgress" );

jest.mock( "react-native/Libraries/Animated/NativeAnimatedHelper" );
describe( "UploadStatus", () => {
  it( "does not show progress bar when progress is less than 5%", async () => {
    render( <UploadStatus progress={0.01} color="#454545" completeColor="#77b300" /> );

    // eslint-disable-next-line testing-library/no-debugging-utils
    screen.debug();
    expect( screen.queryByTestId( "UploadStatus.CircularProgress" ) ).toBeFalsy();
    expect( screen ).toMatchSnapshot();
  } );

  it( "shows progress bar when progress is greater than 5%", async () => {
    render( <UploadStatus progress={0.5} color="#454545" completeColor="#77b300" /> );

    // eslint-disable-next-line testing-library/no-debugging-utils
    screen.debug();
    expect( screen.getByTestId( "UploadStatus.CircularProgress" ) ).toBeTruthy();
    expect( screen ).toMatchSnapshot();
  } );
} );
