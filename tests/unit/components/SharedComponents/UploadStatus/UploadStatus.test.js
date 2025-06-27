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
  it( "displays start icon when upload is unsynced and not queued", async () => {
    render( <UploadStatus progress={0} queued={false} /> );

    expect( screen.getByTestId( /UploadIcon.start/ ) ).toBeTruthy();
    expect( screen ).toMatchSnapshot();
  } );

  it( "displays rotating circle progress when upload is queued but not started", async () => {
    render( <UploadStatus progress={0} queued /> );

    expect( screen.getByTestId( "UploadStatus.QueuedRotatingIcon" ) ).toBeTruthy();
    expect( screen ).toMatchSnapshot();
  } );

  it( "displays progress bar when progress is greater than 5%", async () => {
    render( <UploadStatus progress={0.5} /> );

    expect( screen.getByTestId( "UploadStatus.CircularProgress" ) ).toBeTruthy();
    expect( screen ).toMatchSnapshot();
  } );

  it( "displays complete icon when progress is 1", async () => {
    render( <UploadStatus progress={1} /> );

    expect( screen.getByTestId( "UploadStatus.Complete" ) ).toBeTruthy();
    expect( screen ).toMatchSnapshot();
  } );

  it( "has no accessibility errors", () => {
    expect( <UploadStatus progress={0.5} /> ).toBeAccessible();
  } );
} );
