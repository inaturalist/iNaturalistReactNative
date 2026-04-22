import {
  screen,
} from "@testing-library/react-native";
import ObsUploadStatus from "components/ObservationsFlashList/ObsUploadStatus";
import i18next from "i18next";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockUnsyncedObservation = factory( "LocalObservation", {
  _synced_at: null,
} );

const mockEditedObservation = factory( "LocalObservation", {
  _synced_at: faker.date.past( ),
  _updated_at: faker.date.future( ),
} );

const initialStoreState = useStore.getState( );
beforeAll( ( ) => {
  useStore.setState( initialStoreState, true );
} );

describe( "ObsUploadStatus", () => {
  it( "displays a pending upload for an unsynced observation", () => {
    renderComponent(
      <ObsUploadStatus
        observation={mockUnsyncedObservation}
        progress={0}
      />,
    );

    const icon = screen.getByLabelText( i18next.t( "Start-upload" ) );
    expect( icon ).toBeVisible( );
  } );

  it( "displays a pending upload for a locally edited observation", () => {
    renderComponent(
      <ObsUploadStatus
        observation={mockEditedObservation}
        progress={0}
      />,
    );

    const icon = screen.getByLabelText( i18next.t( "Start-upload" ) );
    expect( icon ).toBeVisible( );
  } );

  it( "displays an upload in progress", async ( ) => {
    renderComponent(
      <ObsUploadStatus
        observation={mockUnsyncedObservation}
        progress={0.05}
      />,
    );

    const progressIcon = screen.getByLabelText( i18next.t( "Upload-in-progress" ) );
    expect( progressIcon ).toBeVisible( );
  } );

  it( "displays a completed upload", async () => {
    renderComponent(
      <ObsUploadStatus
        observation={mockUnsyncedObservation}
        progress={1}
      />,
    );

    const a11yLabel = screen.getByLabelText( i18next.t( "Upload-Complete" ) );
    expect( a11yLabel ).toBeVisible( );
  } );
} );
