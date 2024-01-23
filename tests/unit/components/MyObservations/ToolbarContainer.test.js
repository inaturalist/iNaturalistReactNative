import { screen } from "@testing-library/react-native";
import ToolbarContainer from "components/MyObservations/ToolbarContainer";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";
import { renderComponent } from "tests/helpers/render";

describe( "Toolbar", () => {
  beforeAll( async () => {
    await initI18next();
  } );

  it( "displays a pending upload", async () => {
    renderComponent( <ToolbarContainer
      numUnuploadedObs={1}
      uploadState={{
        uploadInProgress: false,
        uploads: [{}, {}, {}, {}],
        uploadsComplete: false,
        error: null,
        currentUploadCount: 1
      }}
    /> );

    const statusText = screen.getByText( i18next.t( "Upload-x-observations", { count: 1 } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays an upload in progress", async () => {
    renderComponent( <ToolbarContainer
      numUnuploadedObs={1}
      totalUploadCount={1}
      uploadState={{
        uploadInProgress: true,
        uploads: [{}],
        uploadsComplete: false,
        error: null,
        currentUploadCount: 1
      }}
    /> );

    const statusText = screen.getByText( i18next.t( "Uploading-x-of-y-observations", {
      total: 1,
      currentUploadCount: 1
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays a completed upload", async () => {
    renderComponent( <ToolbarContainer
      progress={1}
      totalUploadCount={1}
      uploadState={{
        uploadInProgress: false,
        uploads: [{}],
        uploadsComplete: true,
        error: null,
        currentUploadCount: 1
      }}
    /> );

    const statusText = screen.getByText( i18next.t( "X-observations-uploaded", {
      count: 1
    } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays an upload error", async () => {
    const error = "Couldn't complete upload";
    renderComponent( <ToolbarContainer
      uploadState={{
        uploadInProgress: false,
        uploads: [{}],
        uploadsComplete: false,
        error,
        currentUploadCount: 1
      }}
    /> );
    expect( screen.getByText( error ) ).toBeVisible( );
  } );

  it( "displays multiple pending uploads", async () => {
    renderComponent( <ToolbarContainer
      numUnuploadedObs={4}
      uploadState={{
        uploadInProgress: false,
        uploads: [{}, {}, {}, {}],
        uploadsComplete: false,
        error: null,
        currentUploadCount: 0
      }}
    /> );

    const statusText = screen.getByText( i18next.t( "Upload-x-observations", { count: 4 } ) );
    expect( statusText ).toBeVisible( );
  } );

  it( "displays multiple uploads in progress", async () => {
    renderComponent( <ToolbarContainer
      numUnuploadedObs={3}
      totalUploadCount={5}
      uploadState={{
        uploadInProgress: true,
        uploads: [{}, {}, {}, {}, {}],
        uploadsComplete: false,
        error: null,
        currentUploadCount: 2
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
      totalUploadCount={7}
      uploadState={{
        uploadInProgress: false,
        uploads: [{}, {}, {}, {}, {}, {}, {}],
        uploadsComplete: true,
        error: null,
        currentUploadCount: 1
      }}
    /> );

    const statusText = screen.getByText( i18next.t( "X-observations-uploaded", {
      count: 7
    } ) );
    expect( statusText ).toBeVisible( );
  } );
} );
