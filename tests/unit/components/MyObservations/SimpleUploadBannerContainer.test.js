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
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";

const mockUser = {};

const deletionStore = {
  currentDeleteCount: 1,
  deleteQueue: [{}],
  deleteError: null,
  syncingStatus: SYNC_PENDING
};

const initialState = useStore.getInitialState();

beforeAll( ( ) => {
  jest.useFakeTimers( );
} );

describe( "SimpleUploadBannerContainer", () => {
  it( "displays syncing text before beginning uploads when sync button tapped", ( ) => {
    useStore.setState( {
      layout: {
        ...initialState.layout,
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
        ...initialState.layout,
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
        ...initialState.layout,
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
        ...initialState.layout,
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
        ...initialState.layout,
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
        ...initialState.layout,
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
        ...initialState.layout,
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

  it( "displays 1 upload completed and 4 failed", () => {
    useStore.setState( {
      layout: {
        ...initialState.layout,
        isDefaultMode: false
      },
      numUploadsAttempted: 5,
      uploadStatus: UPLOAD_COMPLETE,
      syncingStatus: SYNC_PENDING,
      initialNumObservationsInQueue: 5,
      errorsByUuid: {
        1: true,
        2: true,
        3: true,
        4: true
      }
    } );
    renderComponent( <SimpleUploadBannerContainer currentUser={mockUser} /> );

    const successText = screen.getByText( /1 observation uploaded/ );
    const errorText = screen.getByText( /4 uploads failed/ );
    expect( successText ).toBeVisible( );
    expect( errorText ).toBeVisible( );
  } );

  it( "displays only error when all 5 uploads failed", () => {
    useStore.setState( {
      layout: {
        ...initialState.layout,
        isDefaultMode: false
      },
      uploadStatus: UPLOAD_COMPLETE,
      syncingStatus: SYNC_PENDING,
      initialNumObservationsInQueue: 5,
      numUploadsAttempted: 5,
      errorsByUuid: {
        1: true,
        2: true,
        3: true,
        4: true,
        5: true
      }
    } );
    renderComponent( <SimpleUploadBannerContainer currentUser={mockUser} /> );

    const errorText = screen.getByText( /5 uploads failed/ );
    expect( errorText ).toBeVisible();
    const successText = screen.queryByText( /1 observation uploaded/ );
    expect( successText ).toBeFalsy();
  } );

  it( "displays 4 uploads completed and 1 failed", () => {
    useStore.setState( {
      layout: {
        ...initialState.layout,
        isDefaultMode: false
      },
      uploadStatus: UPLOAD_COMPLETE,
      syncingStatus: SYNC_PENDING,
      initialNumObservationsInQueue: 5,
      numUploadsAttempted: 5,
      errorsByUuid: { 1: true }
    } );
    renderComponent( <SimpleUploadBannerContainer currentUser={mockUser} /> );

    const successText = screen.getByText( /4 observations uploaded/ );
    const errorText = screen.getByText( /1 upload failed/ );
    expect( successText ).toBeVisible();
    expect( errorText ).toBeVisible();
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
        ...initialState.layout,
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
        ...initialState.layout,
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
        ...initialState.layout,
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
      uploadStatus: UPLOAD_PENDING,
      syncingStatus: SYNC_PENDING
    } );
    setStoreStateLayout( {
      isDefaultMode: false
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
