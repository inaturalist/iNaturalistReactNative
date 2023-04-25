import { useRoute } from "@react-navigation/native";
import { screen, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";
import Observation from "realmModels/Observation";

import factory from "../factory";
import { renderComponent } from "../helpers/render";
import { signIn, signOut } from "../helpers/user";

beforeEach( async ( ) => {
  global.realm.write( ( ) => {
    global.realm.deleteAll( );
  } );
  const mockUser = factory( "LocalUser" );
  await signIn( mockUser );
} );

afterEach( ( ) => {
  signOut( );
  jest.clearAllMocks( );
} );

function renderObsEdit( update ) {
  return renderComponent(
    <ObsEditProvider>
      <ObsEdit />
    </ObsEditProvider>,
    update
  );
}

describe( "UUID in params", ( ) => {
  it( "should set the observation in context when context is blank", async ( ) => {
    const observation = await Observation.saveLocalObservationForUpload(
      factory( "LocalObservation" ),
      global.realm
    );
    useRoute.mockImplementation( ( ) => ( { params: { uuid: observation.uuid } } ) );
    renderObsEdit( );
    await waitFor( ( ) => {
      expect( screen.getByText( observation.taxon.name ) ).toBeTruthy( );
    } );
  } );

  // I don't love this approach. What I want to do is assert that the context
  // has the value I expect it has, but I don't see a way to do that without
  // mocking the entirety of ObsEditProvider, which I don't want to do
  // because that's one of the systems under test here
  it( "should render the observation in params after viewing other observation", async ( ) => {
    const observation = await Observation.saveLocalObservationForUpload(
      factory( "LocalObservation" ),
      global.realm
    );
    useRoute.mockImplementation( () => ( { params: { uuid: observation.uuid } } ) );
    const { update } = renderObsEdit();
    expect( await screen.findByText( observation.taxon.name ) ).toBeTruthy();
    // Up to this point we're just repeating the prior test to ensure that the
    // observation in the params gets inserted into the context

    // Now we alter the params so they specify a different observation
    const newObservation = await Observation.saveLocalObservationForUpload(
      factory( "LocalObservation" ),
      global.realm
    );
    useRoute.mockImplementation( () => ( {
      params: { uuid: newObservation.uuid }
    } ) );
    await renderObsEdit( update );
    expect( screen.getByText( newObservation.taxon.name ) ).toBeTruthy();
    expect( screen.queryByText( observation.taxon.name ) ).toBeFalsy();
  } );

  it( "should not reset the observation in context when context has "
      + "the same observation", async ( ) => {
    const observation = await Observation.saveLocalObservationForUpload(
      factory( "LocalObservation" ),
      global.realm
    );
    useRoute.mockImplementation( ( ) => ( { params: { uuid: observation.uuid } } ) );
    const { update } = renderObsEdit( );
    expect( await screen.findByText( observation.taxon.name ) ).toBeTruthy( );
    useRoute.mockImplementation( ( ) => ( { params: { uuid: observation.uuid } } ) );
    await renderObsEdit( update );
    expect( await screen.findByText( observation.taxon.name ) ).toBeTruthy( );
  } );
} );
