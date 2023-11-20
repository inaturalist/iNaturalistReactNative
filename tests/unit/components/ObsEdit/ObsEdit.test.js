import { screen } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import initI18next from "i18n/initI18next";
import { ObsEditContext } from "providers/contexts";
import INatPaperProvider from "providers/INatPaperProvider";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockLocationName = "San Francisco, CA";

const mockCurrentUser = factory( "LocalUser" );

jest.mock( "components/ObsEdit/Header" );
jest.mock( "components/ObsEdit/Sheets/DeleteObservationSheet" );
jest.mock( "components/MediaViewer/MediaViewer" );
jest.mock( "components/ObsEdit/EvidenceSection" );
jest.mock( "components/ObsEdit/IdentificationSection" );
jest.mock( "components/ObsEdit/OtherDataSection" );
jest.mock( "components/ObsEdit/Sheets/AddEvidenceSheet" );

// Mock ObservationProvider so it provides a specific array of observations
// without any current observation or ability to update or fetch
// observations
jest.mock( "providers/ObsEditProvider" );
const mockObsEditProviderWithObs = obs => ObsEditProvider.mockImplementation( ( { children } ) => (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  <INatPaperProvider>
    <ObsEditContext.Provider value={{
      observations: obs,
      currentObservation: obs[0],
      setPassesIdentificationTest: jest.fn( )
    }}
    >
      {children}
    </ObsEditContext.Provider>
  </INatPaperProvider>
) );

const renderObsEdit = ( ) => renderComponent(
  <ObsEditProvider>
    <ObsEdit />
  </ObsEditProvider>
);

describe( "ObsEdit", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should not have accessibility errors", async () => {
    const observations = [
      factory( "RemoteObservation", {
        latitude: 37.99,
        longitude: -142.88,
        user: mockCurrentUser,
        place_guess: mockLocationName
      } )
    ];
    mockObsEditProviderWithObs( observations );
    renderObsEdit( );

    const obsEdit = await screen.findByTestId( "obs-edit" );
    expect( obsEdit ).toBeAccessible();
  } );
} );
