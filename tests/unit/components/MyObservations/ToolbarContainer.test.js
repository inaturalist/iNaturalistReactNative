import { screen } from "@testing-library/react-native";
import * as useDeleteObservations from "components/MyObservations/hooks/useDeleteObservations.ts";
import {
  INITIAL_STATE as MYOBS_INITIAL_STATE
} from "components/MyObservations/MyObservationsContainer";
import ToolbarContainer from "components/MyObservations/ToolbarContainer";
import i18next from "i18next";
import React from "react";
import { renderComponent } from "tests/helpers/render";

jest.mock( "components/MyObservations/hooks/useDeleteObservations", () => ( {
  __esModule: true,
  default: ( ) => ( {
    currentDeleteCount: 1,
    deletions: [],
    deletionsComplete: false,
    deletionsInProgress: false,
    error: null
  } )
} ) );

const deletionState = {
  currentDeleteCount: 3,
  deletions: [{}, {}, {}],
  deletionsComplete: false,
  deletionsInProgress: false,
  error: null
};

const uploadState = {
  ...MYOBS_INITIAL_STATE,
  uploads: [{}],
  numUnuploadedObs: 1,
  numToUpload: 1
};

describe( "Toolbar", () => {
  it( "displays a pending upload", async () => {
    renderComponent( <ToolbarContainer
      numUnuploadedObs={1}
      uploadState={uploadState}
    /> );

    const statusText = screen.getByText( i18next.t( "Upload-x-observations", { count: 1 } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays an upload in progress", async () => {
    renderComponent( <ToolbarContainer
      numUnuploadedObs={1}
      uploadState={{
        ...uploadState,
        uploadInProgress: true,
        numToUpload: 1
      }}
    /> );

    const statusText = screen.getByText( i18next.t( "Uploading-x-of-y-observations", {
      total: 1,
      currentUploadCount: 1
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays a completed upload", async () => {
    const numFinishedUploads = 1;
    renderComponent( <ToolbarContainer
      progress={1}
      uploadState={{
        ...uploadState,
        uploadsComplete: true,
        numFinishedUploads,
        uploaded: [...Array( numFinishedUploads ).keys( )].map( i => `fake-uuid-${i}` )
      }}
    /> );

    const statusText = screen.getByText( i18next.t( "X-observations-uploaded", {
      count: numFinishedUploads
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays an upload error", async () => {
    const multiError = "Couldn't complete upload";
    renderComponent( <ToolbarContainer
      uploadState={{
        ...uploadState,
        multiError
      }}
      numUnuploadedObs={1}
    /> );
    expect( screen.getByText( multiError ) ).toBeVisible( );
  } );

  it( "displays multiple pending uploads", async () => {
    renderComponent( <ToolbarContainer
      numUnuploadedObs={4}
      uploadState={{
        ...uploadState,
        uploads: [{}, {}, {}, {}]
      }}
    /> );

    const statusText = screen.getByText( i18next.t( "Upload-x-observations", { count: 4 } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays multiple uploads in progress", async () => {
    renderComponent( <ToolbarContainer
      numUnuploadedObs={5}
      uploadState={{
        ...uploadState,
        uploadInProgress: true,
        uploads: [{}, {}, {}, {}],
        numToUpload: 5,
        numFinishedUploads: 1
      }}
    /> );

    const statusText = screen.getByText( i18next.t( "Uploading-x-of-y-observations", {
      total: 5,
      currentUploadCount: 2
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays multiple completed uploads", async () => {
    renderComponent( <ToolbarContainer
      progress={1}
      uploadState={{
        ...uploadState,
        uploads: [{}, {}, {}, {}, {}, {}, {}],
        uploadsComplete: true,
        numToUpload: 7,
        uploaded: ["1", "2", "3", "4", "5", "6", "7"]
      }}
    /> );

    const statusText = screen.getByText( i18next.t( "X-observations-uploaded", {
      count: 7
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays deletions in progress", async () => {
    jest.spyOn( useDeleteObservations, "default" ).mockImplementation( ( ) => ( {
      ...deletionState,
      deletionsInProgress: true,
      currentDeleteCount: 2
    } ) );
    renderComponent( <ToolbarContainer uploadState={uploadState} /> );

    const statusText = screen.getByText( i18next.t( "Deleting-x-of-y-observations", {
      total: 3,
      currentDeleteCount: 2
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays deletions completed", async () => {
    jest.spyOn( useDeleteObservations, "default" ).mockImplementation( ( ) => ( {
      ...deletionState,
      deletionsComplete: true
    } ) );
    renderComponent( <ToolbarContainer uploadState={uploadState} /> );

    const statusText = screen.getByText( i18next.t( "X-observations-deleted", {
      count: 3
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays deletion error", async () => {
    const error = "Unknown problem deleting observations";
    jest.spyOn( useDeleteObservations, "default" ).mockImplementation( ( ) => ( {
      ...deletionState,
      error
    } ) );
    renderComponent( <ToolbarContainer uploadState={uploadState} /> );

    const statusText = screen.getByText( error );
    expect( statusText ).toBeVisible( );
  } );
} );
