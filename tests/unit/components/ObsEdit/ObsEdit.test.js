import { screen } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import initI18next from "i18n/initI18next";
import { ObsEditContext } from "providers/contexts";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockLocationName = "San Francisco, CA";

const mockCurrentUser = factory( "LocalUser" );

const mockObservations = [
  factory( "RemoteObservation", {
    latitude: 37.99,
    longitude: -142.88,
    user: mockCurrentUser,
    place_guess: mockLocationName
  } )
];

const renderObsEdit = obs => renderComponent(
  <ObsEditContext.Provider value={{
    observations: obs,
    currentObservation: obs[0],
    setPassesIdentificationTest: jest.fn( )
  }}
  >
    <ObsEdit />
  </ObsEditContext.Provider>
);

describe( "ObsEdit", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should not have accessibility errors", async () => {
    renderObsEdit( mockObservations );

    const obsEdit = await screen.findByTestId( "obs-edit" );
    expect( obsEdit ).toBeAccessible();
  } );
} );
