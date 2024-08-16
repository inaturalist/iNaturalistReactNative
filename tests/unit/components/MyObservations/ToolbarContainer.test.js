import { screen } from "@testing-library/react-native";
import ToolbarContainer from "components/MyObservations/ToolbarContainer";
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
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

const initialStoreState = useStore.getState( );

const deletionStore = {
  currentDeleteCount: 1,
  deleteQueue: [{}],
  deleteError: null,
  syncingStatus: SYNC_PENDING
};

beforeAll( ( ) => {
  jest.useFakeTimers( );
} );

describe( "Toolbar Container", () => {
  beforeEach( ( ) => {
    useStore.setState( initialStoreState, true );
  } );

  it( "displays syncing text before beginning uploads when sync button tapped", ( ) => {
    useStore.setState( {
      numUnuploadedObservations: 1,
      uploadStatus: UPLOAD_PENDING,
      syncingStatus: MANUAL_SYNC_IN_PROGRESS
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( /Syncing.../ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays a pending upload", ( ) => {
    useStore.setState( {
      numUnuploadedObservations: 1,
      uploadStatus: UPLOAD_PENDING,
      syncingStatus: SYNC_PENDING
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( /Upload 1 observation/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays an upload in progress", ( ) => {
    useStore.setState( {
      initialNumObservationsInQueue: 1,
      numUploadsAttempted: 1,
      uploadStatus: UPLOAD_IN_PROGRESS,
      syncingStatus: SYNC_PENDING
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( /Uploading 1 observation/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays a completed upload", () => {
    const numUploadsAttempted = 1;
    useStore.setState( {
      numUploadsAttempted,
      uploadStatus: UPLOAD_COMPLETE,
      syncingStatus: SYNC_PENDING,
      initialNumObservationsInQueue: numUploadsAttempted
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( /1 observation uploaded/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays an upload error", () => {
    const multiError = "Couldn't complete upload";
    useStore.setState( {
      multiError,
      syncingStatus: SYNC_PENDING
    } );
    renderComponent( <ToolbarContainer /> );
    expect( screen.getByText( multiError ) ).toBeVisible( );
  } );

  it( "displays multiple pending uploads", () => {
    useStore.setState( {
      numUnuploadedObservations: 4,
      uploadStatus: UPLOAD_PENDING,
      syncingStatus: SYNC_PENDING
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( /Upload 4 observations/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays multiple uploads in progress", () => {
    useStore.setState( {
      uploadStatus: UPLOAD_IN_PROGRESS,
      numUploadsAttempted: 2,
      syncingStatus: SYNC_PENDING,
      initialNumObservationsInQueue: 5
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( /Uploading 2 of 5 observations/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays multiple completed uploads", () => {
    const numUploadsAttempted = 7;
    useStore.setState( {
      numUploadsAttempted,
      uploadStatus: UPLOAD_COMPLETE,
      syncingStatus: SYNC_PENDING,
      initialNumObservationsInQueue: numUploadsAttempted
    } );
    renderComponent( <ToolbarContainer /> );

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
  //   renderComponent( <ToolbarContainer /> );

  //   const statusText = screen.getByText( /Deleting 1 of 1 observation/ );
  //   expect( statusText ).toBeVisible( );
  // } );

  it( "displays deletions completed", () => {
    useStore.setState( {
      ...deletionStore,
      currentDeleteCount: 1,
      deleteQueue: [{}],
      initialNumDeletionsInQueue: 1
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( /1 observation deleted/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays deletion error", ( ) => {
    const deleteError = "Unknown problem deleting observations";
    useStore.setState( {
      ...deletionStore,
      deleteError,
      initialNumDeletionsInQueue: 2
    } );
    renderComponent( <ToolbarContainer /> );

    const deletingText = screen.getByText( /Deleting/ );
    expect( deletingText ).toBeVisible( );

    const statusText = screen.getByText( deleteError );
    expect( statusText ).toBeVisible( );
  } );
} );
