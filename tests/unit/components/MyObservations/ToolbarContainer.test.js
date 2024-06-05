import { screen } from "@testing-library/react-native";
import ToolbarContainer from "components/MyObservations/ToolbarContainer";
import i18next from "i18next";
import React from "react";
import {
  UPLOAD_COMPLETE,
  UPLOAD_IN_PROGRESS,
  UPLOAD_PENDING
} from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

const initialStoreState = useStore.getState( );

const deletionStore = {
  currentDeleteCount: 3,
  deletions: [{}, {}, {}],
  deletionsComplete: false,
  deletionsInProgress: false,
  error: null
};

describe( "Toolbar Container", () => {
  beforeEach( async () => {
    useStore.setState( initialStoreState, true );
  } );

  it( "displays a pending upload", async () => {
    useStore.setState( {
      numUnuploadedObservations: 1,
      uploadStatus: UPLOAD_PENDING
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "Upload-x-observations", { count: 1 } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays an upload in progress", async () => {
    useStore.setState( {
      numObservationsInQueue: 1,
      numUploadsAttempted: 1,
      uploadStatus: UPLOAD_IN_PROGRESS
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "Uploading-x-of-y-observations", {
      total: 1,
      currentUploadCount: 1
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays a completed upload", async () => {
    const numUploadsAttempted = 1;
    useStore.setState( {
      numUploadsAttempted,
      numObservationsInQueue: numUploadsAttempted,
      uploadStatus: UPLOAD_COMPLETE
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "X-observations-uploaded", {
      count: numUploadsAttempted
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays an upload error", async () => {
    const multiError = "Couldn't complete upload";
    useStore.setState( {
      multiError
    } );
    renderComponent( <ToolbarContainer /> );
    expect( screen.getByText( multiError ) ).toBeVisible( );
  } );

  it( "displays multiple pending uploads", async () => {
    useStore.setState( {
      numUnuploadedObservations: 4,
      uploadStatus: UPLOAD_PENDING
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "Upload-x-observations", { count: 4 } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays multiple uploads in progress", async () => {
    useStore.setState( {
      uploadStatus: UPLOAD_IN_PROGRESS,
      numObservationsInQueue: 5,
      numUploadsAttempted: 2
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "Uploading-x-of-y-observations", {
      total: 5,
      currentUploadCount: 2
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays multiple completed uploads", async () => {
    const numUploadsAttempted = 7;
    useStore.setState( {
      numUploadsAttempted,
      numObservationsInQueue: numUploadsAttempted,
      uploadStatus: UPLOAD_COMPLETE
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "X-observations-uploaded", {
      count: numUploadsAttempted
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays deletions in progress", async () => {
    useStore.setState( {
      ...deletionStore,
      deletionsInProgress: true,
      currentDeleteCount: 2
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "Deleting-x-of-y-observations", {
      total: 3,
      currentDeleteCount: 2
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays deletions completed", async () => {
    useStore.setState( {
      ...deletionStore,
      deletionsComplete: true
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "X-observations-deleted", {
      count: 3
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays deletion error", async () => {
    const deleteError = "Unknown problem deleting observations";
    useStore.setState( {
      ...deletionStore,
      deleteError
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( deleteError );
    expect( statusText ).toBeVisible( );
  } );
} );
