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
    // TODO: (Johannes 2025-06-13) An update to react-native-reanimated (to 3.16.6) caused this test
    // to fail. However, only the snapshot matching is affected, the component still renders
    // correctly, and the test passes, i.e. the correct icon is shown. The actual error thrown is a
    // recursion happening in the pretty-format library. So, since we are currently only half-way
    // through our updating process of major react-native versions and libraries I vouch to comment
    // out these snapshot tests for now and reinstate them later with the latest RN version.
    /*
      RangeError: Invalid string length
      at printObjectProperties (node_modules/pretty-format/build/collections.js:170:47)
      at key (node_modules/pretty-format/build/index.js:386:38)
      at AsymmetricMatcher (node_modules/pretty-format/build/index.js:469:3)
      at printObjectProperties (node_modules/pretty-format/build/collections.js:169:21)
      at key (node_modules/pretty-format/build/index.js:386:38)
      at AsymmetricMatcher (node_modules/pretty-format/build/index.js:469:3)
      at printObjectProperties (node_modules/pretty-format/build/collections.js:169:21)
      at key (node_modules/pretty-format/build/index.js:386:38)
      at AsymmetricMatcher (node_modules/pretty-format/build/index.js:469:3)
    */
    // expect( screen ).toMatchSnapshot();
  } );

  it( "displays rotating circle progress when upload is queued but not started", async () => {
    render( <UploadStatus progress={0} queued /> );
    expect( screen.getByTestId( "UploadStatus.QueuedRotatingIcon" ) ).toBeTruthy();
    // TODO: (Johannes 2025-06-13) An update to react-native-reanimated (to 3.16.6) caused this test
    // to fail. However, only the snapshot matching is affected, the component still renders
    // correctly, and the test passes, i.e. the correct icon is shown. The actual error thrown is a
    // recursion happening in the pretty-format library. So, since we are currently only half-way
    // through our updating process of major react-native versions and libraries I vouch to comment
    // out these snapshot tests for now and reinstate them later with the latest RN version.
    /*
      RangeError: Invalid string length
      at printObjectProperties (node_modules/pretty-format/build/collections.js:170:47)
      at key (node_modules/pretty-format/build/index.js:386:38)
      at AsymmetricMatcher (node_modules/pretty-format/build/index.js:469:3)
      at printObjectProperties (node_modules/pretty-format/build/collections.js:169:21)
      at key (node_modules/pretty-format/build/index.js:386:38)
      at AsymmetricMatcher (node_modules/pretty-format/build/index.js:469:3)
      at printObjectProperties (node_modules/pretty-format/build/collections.js:169:21)
      at key (node_modules/pretty-format/build/index.js:386:38)
      at AsymmetricMatcher (node_modules/pretty-format/build/index.js:469:3)
    */
    // expect( screen ).toMatchSnapshot();
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
