import { render, screen } from "@testing-library/react-native";
import { UploadStatus } from "components/SharedComponents";
import React from "react";

jest.mock( "react-native-circular-progress-indicator", () => "CircularProgress" );

jest.mock( "react-native/Libraries/Animated/NativeAnimatedHelper" );
describe( "UploadStatus", () => {
  it( "does not show progress bar when progress is less than 5%", async () => {
    render( <UploadStatus progress={0.01} color="#454545" completeColor="#77b300" /> );

    expect( screen.queryByTestId( "UploadStatus.CircularProgress" ) ).toBeFalsy();
  } );

  it( "shows progress bar when progress is greater than 5%", async () => {
    render( <UploadStatus progress={0.5} color="#454545" completeColor="#77b300" /> );

    expect( screen.getByTestId( "UploadStatus.CircularProgress" ) ).toBeTruthy();
  } );

  it( "displays progress bar when progress is less than 5% correctly", async () => {
    render( <UploadStatus progress={0.01} color="#454545" completeColor="#77b300" /> );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "displays progress bar when progress is greater than 5% correctly", async () => {
    render( <UploadStatus progress={0.5} color="#454545" completeColor="#77b300" /> );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "has no accessibility errors", () => {
    const uploadStatus = (
      <UploadStatus progress={0.5} color="#454545" completeColor="#77b300" />
    );

    expect( uploadStatus ).toBeAccessible();
  } );
} );
