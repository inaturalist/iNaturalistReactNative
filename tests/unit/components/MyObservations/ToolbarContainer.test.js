import { screen } from "@testing-library/react-native";
import ToolbarContainer from "components/MyObservations/ToolbarContainer";
import React from "react";
import {
  AUTOMATIC_SYNC_COMPLETE,
  HANDLING_LOCAL_DELETIONS,
  SYNC_PENDING,
  SYNCING_REMOTE_DELETIONS
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
  deletions: [{}],
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
      syncingStatus: SYNCING_REMOTE_DELETIONS
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( /Syncing.../ );
    expect( statusText ).toBeVisible( );
  } );

  it( "does not display syncing text when user lands on screen and automatic sync happens", ( ) => {
    useStore.setState( {
      numUnuploadedObservations: 0,
      uploadStatus: UPLOAD_PENDING,
      syncingStatus: SYNCING_REMOTE_DELETIONS
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.queryByText( /Syncing.../ );
    expect( statusText ).toBeFalsy( );
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

  it( "displays deletions in progress", async () => {
    useStore.setState( {
      ...deletionStore,
      syncingStatus: HANDLING_LOCAL_DELETIONS
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( /Deleting 1 of 1 observation/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays deletions completed", () => {
    useStore.setState( {
      ...deletionStore,
      syncingStatus: AUTOMATIC_SYNC_COMPLETE
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( /1 observation deleted/ );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays deletion error", () => {
    const deleteError = "Unknown problem deleting observations";
    useStore.setState( {
      ...deletionStore,
      deleteError,
      syncingStatus: HANDLING_LOCAL_DELETIONS
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( deleteError );
    expect( statusText ).toBeVisible( );
  } );
} );
