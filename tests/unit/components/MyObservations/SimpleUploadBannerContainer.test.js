import { screen } from "@testing-library/react-native";
import SimpleUploadBannerContainer from "components/MyObservations/SimpleUploadBannerContainer";
import React from "react";
import {
  MANUAL_SYNC_IN_PROGRESS,
  SYNC_PENDING
} from "stores/createSyncObservationsSlice.ts";
import {
  UPLOAD_COMPLETE,
  UPLOAD_IN_PROGRESS,
  UPLOAD_PENDING
} from "stores/createUploadObservationsSlice.ts";
import useStore, { zustandStorage } from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

const mockUser = {};

const deletionStore = {
  currentDeleteCount: 1,
  deleteQueue: [{}],
  deleteError: null,
  syncingStatus: SYNC_PENDING
};

beforeAll( ( ) => {
  jest.useFakeTimers( );
} );

describe( "SimpleUploadBannerContainer", () => {
  it( "displays syncing text before beginning uploads when sync button tapped", ( ) => {
    useStore.setState( {
      layout: {
        isDefaultMode: false
      },
      numUnuploadedObservations: 1,
      uploadStatus: UPLOAD_PENDING,
      syncingStatus: MANUAL_SYNC_IN_PROGRESS
    } );
    renderComponent( <SimpleUploadBannerContainer currentUser={mockUser} /> );

    const statusText = screen.getByText( /Syncing.../ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays a pending upload", ( ) => {
    useStore.setState( {
      layout: {
        isDefaultMode: false
      },
      uploadStatus: UPLOAD_PENDING,
      syncingStatus: SYNC_PENDING
    } );
    renderComponent(
      <SimpleUploadBannerContainer
        numUploadableObservations={1}
        currentUser={mockUser}
      />
    );

    const statusText = screen.getByText( /Upload 1 observation/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays an upload in progress", ( ) => {
    useStore.setState( {
      layout: {
        isDefaultMode: false
      },
      initialNumObservationsInQueue: 1,
      numUploadsAttempted: 1,
      uploadStatus: UPLOAD_IN_PROGRESS,
      syncingStatus: SYNC_PENDING
    } );
    renderComponent( <SimpleUploadBannerContainer currentUser={mockUser} /> );

    const statusText = screen.getByText( /Uploading 1 observation/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays a completed upload", () => {
    const numUploadsAttempted = 1;
    useStore.setState( {
      layout: {
        isDefaultMode: false
      },
      numUploadsAttempted,
      uploadStatus: UPLOAD_COMPLETE,
      syncingStatus: SYNC_PENDING,
      initialNumObservationsInQueue: numUploadsAttempted
    } );
    renderComponent( <SimpleUploadBannerContainer currentUser={mockUser} /> );

    const statusText = screen.getByText( /1 observation uploaded/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays multiple pending uploads", () => {
    useStore.setState( {
      layout: {
        isDefaultMode: false
      },
      uploadStatus: UPLOAD_PENDING,
      syncingStatus: SYNC_PENDING
    } );
    renderComponent(
      <SimpleUploadBannerContainer
        numUploadableObservations={4}
        currentUser={mockUser}
      />
    );

    const statusText = screen.getByText( /Upload 4 observations/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays multiple uploads in progress", () => {
    useStore.setState( {
      layout: {
        isDefaultMode: false
      },
      uploadStatus: UPLOAD_IN_PROGRESS,
      numUploadsAttempted: 2,
      syncingStatus: SYNC_PENDING,
      initialNumObservationsInQueue: 5
    } );
    renderComponent( <SimpleUploadBannerContainer currentUser={mockUser} /> );

    const statusText = screen.getByText( /Uploading 2 of 5 observations/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays multiple completed uploads", () => {
    const numUploadsAttempted = 7;
    useStore.setState( {
      layout: {
        isDefaultMode: false
      },
      numUploadsAttempted,
      uploadStatus: UPLOAD_COMPLETE,
      syncingStatus: SYNC_PENDING,
      initialNumObservationsInQueue: numUploadsAttempted
    } );
    renderComponent( <SimpleUploadBannerContainer currentUser={mockUser} /> );

    const statusText = screen.getByText( /7 observations uploaded/ );
    expect( statusText ).toBeVisible( );
  } );

  // 20240611 amanda - removing this test for now, since I believe the new intended UI
  // is that the user will only ever see "Syncing..." followed by
  // "1 observation deleted" UI after deleting a local observation. feel free to reinstate this
  // test if I'm misunderstanding the UI

  // it( "displays deletions in progress", async () => {
  //   useStore.setState( {
  //     ...deletionStore,
  //     syncingStatus: HANDLING_LOCAL_DELETIONS
  //   } );
  //   renderComponent( <SimpleUploadBannerContainer /> );

  //   const statusText = screen.getByText( /Deleting 1 of 1 observation/ );
  //   expect( statusText ).toBeVisible( );
  // } );

  it( "displays deletions completed", () => {
    useStore.setState( {
      layout: {
        isDefaultMode: false
      },
      ...deletionStore,
      currentDeleteCount: 1,
      deleteQueue: [{}],
      initialNumDeletionsInQueue: 1
    } );
    renderComponent( <SimpleUploadBannerContainer currentUser={mockUser} /> );

    const statusText = screen.getByText( /1 observation deleted/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays deletion error", ( ) => {
    const deleteError = "Unknown problem deleting observations";
    useStore.setState( {
      layout: {
        isDefaultMode: false
      },
      ...deletionStore,
      deleteError,
      initialNumDeletionsInQueue: 2
    } );
    renderComponent( <SimpleUploadBannerContainer currentUser={mockUser} /> );

    const deletingText = screen.getByText( /Deleting/ );
    expect( deletingText ).toBeVisible( );

    const statusText = screen.getByText( deleteError );
    expect( statusText ).toBeVisible( );
  } );

  it( "should hide banner if logged out and only one observation", ( ) => {
    zustandStorage.setItem( "numOfUserObservations", 1 );
    useStore.setState( {
      layout: {
        isDefaultMode: false
      },
      uploadStatus: UPLOAD_PENDING,
      syncingStatus: SYNC_PENDING,
      numOfUserObservations: 1
    } );
    renderComponent(
      <SimpleUploadBannerContainer
        numUploadableObservations={1}
        currentUser={null}
      />
    );

    const statusText = screen.queryByText( /Upload 1 observation/ );
    expect( statusText ).toBeFalsy( );
  } );

  it( "should show banner if logged out with more than one observation", ( ) => {
    zustandStorage.setItem( "numOfUserObservations", 2 );
    useStore.setState( {
      layout: {
        isDefaultMode: false
      },
      uploadStatus: UPLOAD_PENDING,
      syncingStatus: SYNC_PENDING
    } );
    renderComponent(
      <SimpleUploadBannerContainer
        numUploadableObservations={1}
        currentUser={null}
      />
    );

    const statusText = screen.getByText( /Upload 1 observation/ );
    expect( statusText ).toBeVisible( );
  } );
} );
