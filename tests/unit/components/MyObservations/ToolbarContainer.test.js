import { screen } from "@testing-library/react-native";
import ToolbarContainer from "components/MyObservations/ToolbarContainer";
import i18next from "i18next";
import React from "react";
import useStore from "stores/useStore";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const initialStoreState = useStore.getState( );

const deletionStore = {
  currentDeleteCount: 3,
  deletions: [{}, {}, {}],
  deletionsComplete: false,
  deletionsInProgress: false,
  error: null
};

const mockUUID = faker.string.uuid( );

describe( "Toolbar Container", () => {
  beforeEach( async () => {
    useStore.setState( initialStoreState, true );
  } );

  afterEach( async () => {
    useStore.setState( initialStoreState, true );
  } );

  it( "displays a pending upload", async () => {
    useStore.setState( {
      numToUpload: 1,
      numUnuploadedObs: 1
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "Upload-x-observations", { count: 1 } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays an upload in progress", async () => {
    useStore.setState( {
      numToUpload: 1,
      uploadInProgress: true
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "Uploading-x-of-y-observations", {
      total: 1,
      currentUploadCount: 1
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays a completed upload", async () => {
    const numFinishedUploads = 1;
    useStore.setState( {
      numFinishedUploads,
      uploadsComplete: true,
      uploaded: [...Array( numFinishedUploads ).keys( )].map( i => `fake-uuid-${i}` ),
      totalUploadProgress: [
        {
          uuid: mockUUID,
          totalProgress: 1
        }
      ],
      uploadInProgress: false
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "X-observations-uploaded", {
      count: numFinishedUploads
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays an upload error", async () => {
    const multiError = "Couldn't complete upload";
    useStore.setState( {
      multiError,
      numUnuploadedObs: 1
    } );
    renderComponent( <ToolbarContainer /> );
    expect( screen.getByText( multiError ) ).toBeVisible( );
  } );

  it( "displays multiple pending uploads", async () => {
    useStore.setState( {
      uploads: [{}, {}, {}, {}],
      multiError: null,
      uploaded: [],
      numUnuploadedObs: 4,
      uploadsComplete: false
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "Upload-x-observations", { count: 4 } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays multiple uploads in progress", async () => {
    useStore.setState( {
      uploadInProgress: true,
      uploads: [{}, {}, {}, {}],
      numToUpload: 5,
      numFinishedUploads: 1
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "Uploading-x-of-y-observations", {
      total: 5,
      currentUploadCount: 2
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays multiple completed uploads", async () => {
    useStore.setState( {
      uploads: [{}, {}, {}, {}, {}, {}, {}],
      uploadsComplete: true,
      numToUpload: 7,
      uploaded: ["1", "2", "3", "4", "5", "6", "7"],
      totalToolbarProgress: 1,
      numUnuploadedObs: 0
    } );
    renderComponent( <ToolbarContainer /> );

    const statusText = screen.getByText( i18next.t( "X-observations-uploaded", {
      count: 7
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
