import { render, screen } from "@testing-library/react-native";
import { UploadStatus } from "components/SharedComponents";
import React from "react";
import useStore from "stores/useStore";

const initialStoreState = useStore.getState( );
beforeAll( ( ) => {
  useStore.setState( initialStoreState, true );
} );

jest.mock( "react-native-circular-progress-indicator", () => "CircularProgress" );

jest.mock( "react-native/Libraries/Animated/NativeAnimatedHelper" );
describe( "UploadStatus", () => {
  it( "does not show progress bar when progress is less than 5%", async () => {
    render( <UploadStatus progress={0.01} /> );
    expect( screen.queryByTestId( "UploadStatus.CircularProgress" ) ).toBeFalsy();
    expect( screen ).toMatchSnapshot();
  } );

  it( "displays progress bar when progress is greater than 5%", async () => {
    render( <UploadStatus progress={0.5} /> );
    expect( screen.getByTestId( "UploadStatus.CircularProgress" ) ).toBeTruthy();
    expect( screen ).toMatchSnapshot();
  } );

  it( "has no accessibility errors", () => {
    expect( <UploadStatus progress={0.5} /> ).toBeAccessible();
  } );
} );
