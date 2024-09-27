import { render, screen } from "@testing-library/react-native";
import { UploadStatus } from "components/SharedComponents";
import React from "react";
import useStore from "stores/useStore";
import faker from "tests/helpers/faker";

const initialStoreState = useStore.getState( );
beforeAll( ( ) => {
  useStore.setState( initialStoreState, true );
} );

jest.mock( "react-native-circular-progress-indicator", () => "CircularProgress" );

const mockUUID = faker.string.uuid( );

jest.mock( "react-native/Libraries/Animated/NativeAnimatedHelper" );
describe( "UploadStatus", () => {
  it( "does not show progress bar when progress is less than 5%", async () => {
    useStore.setState( {
      totalUploadProgress: [
        {
          uuid: mockUUID,
          totalProgress: 0.01
        }
      ]
    } );
    render( <UploadStatus uuid={mockUUID} /> );

    expect( screen.queryByTestId( "UploadStatus.CircularProgress" ) ).toBeFalsy();
  } );

  it( "shows progress bar when progress is greater than 5%", async () => {
    useStore.setState( {
      totalUploadProgress: [
        {
          uuid: mockUUID,
          totalProgress: 0.5
        }
      ]
    } );
    render( <UploadStatus uuid={mockUUID} /> );

    expect( screen.getByTestId( "UploadStatus.CircularProgress" ) ).toBeTruthy();
  } );

  it( "displays progress bar when progress is less than 5% correctly", async () => {
    useStore.setState( {
      totalUploadProgress: [
        {
          uuid: undefined,
          totalProgress: 0.01
        }
      ]
    } );
    render( <UploadStatus uuid={undefined} /> );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "displays progress bar when progress is greater than 5% correctly", async () => {
    useStore.setState( {
      totalUploadProgress: [
        {
          uuid: undefined,
          totalProgress: 0.5
        }
      ]
    } );
    render( <UploadStatus uuid={undefined} /> );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "has no accessibility errors", () => {
    useStore.setState( {
      totalUploadProgress: [
        {
          uuid: mockUUID,
          totalProgress: 0.5
        }
      ]
    } );
    const uploadStatus = (
      <UploadStatus uuid={mockUUID} />
    );

    expect( uploadStatus ).toBeAccessible();
  } );
} );
