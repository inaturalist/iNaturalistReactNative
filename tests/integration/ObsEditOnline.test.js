import Geolocation from "@react-native-community/geolocation";
import { screen, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const initialStoreState = useStore.getState( );

const mockLocationName = "San Francisco, CA";

const mockCurrentUser = factory( "LocalUser" );

const renderObsEdit = ( ) => renderComponent( <ObsEdit /> );

const mockTaxon = factory( "RemoteTaxon", {
  name: faker.person.firstName( ),
  rank: "genus",
  rank_level: 27,
  preferred_common_name: faker.person.fullName( ),
  default_photo: {
    square_url: faker.image.url( )
  },
  ancestors: [{
    id: faker.number.int( ),
    preferred_common_name: faker.person.fullName( ),
    name: faker.person.fullName( ),
    rank: "class"
  }],
  wikipedia_summary: faker.lorem.paragraph( ),
  taxonPhotos: [{
    photo: factory( "RemotePhoto" )
  }],
  wikipedia_url: faker.internet.url( )
} );

describe( "basic rendering", ( ) => {
  beforeAll( async () => {
    useStore.setState( initialStoreState, true );
  } );

  it( "should render place_guess and latitude", async ( ) => {
    const observations = [factory( "RemoteObservation", {
      latitude: 37.99,
      longitude: -142.88,
      user: mockCurrentUser,
      place_guess: mockLocationName,
      taxon: mockTaxon,
      observationPhotos: []
    } )];

    useStore.setState( {
      observations,
      currentObservation: observations[0]
    } );
    renderObsEdit( );
    const obs = observations[0];

    expect( await screen.findByText( obs.place_guess ) ).toBeTruthy( );
    expect( screen.getByText( new RegExp( `${obs.latitude}` ) ) ).toBeTruthy( );
  } );
} );

describe( "location fetching", () => {
  beforeAll( async () => {
    useStore.setState( initialStoreState, true );
  } );

  beforeEach( () => {
    // resets mock back to original state
    Geolocation.watchPosition.mockClear();
  } );

  test( "should fetch location when new observation hasn't saved", async ( ) => {
    const observations = [factory( "LocalObservation", {
      observationPhotos: []
    } )];
    useStore.setState( {
      observations,
      currentObservation: observations[0]
    } );

    renderObsEdit( );

    await waitFor( () => {
      expect( Geolocation.watchPosition ).toHaveBeenCalled();
    } );
    // Note: it would be nice to look for an update in the UI
  } );

  test( "shouldn't fetch location for existing obs on device that hasn't uploaded", async () => {
    const observation = factory( "LocalObservation", {
      _created_at: faker.date.past( ),
      latitude: Number( faker.location.latitude( ) ),
      longitude: Number( faker.location.longitude( ) ),
      observationPhotos: []
    } );
    expect( observation.id ).toBeFalsy();
    expect( observation.created_at ).toBeFalsy();
    expect( observation._created_at ).toBeTruthy();
    useStore.setState( {
      observations: [observation],
      currentObservation: observation
    } );
    renderObsEdit( );

    expect(
      screen.getByText( new RegExp( `Lat: ${observation.latitude}` ) )
    ).toBeTruthy();

    // Location may not fetch immediately, so wait for twice the default fetch
    // interval before testing whether the mock was called
    await waitFor( () => undefined );

    expect( Geolocation.watchPosition ).not.toHaveBeenCalled();
  } );

  test( "shouldn't fetch location for existing observation created elsewhere", async () => {
    const observation = factory( "LocalObservation", {
      id: faker.number.int(),
      created_at: faker.date.past(),
      _synced_at: faker.date.past(),
      latitude: Number( faker.location.latitude( ) ),
      longitude: Number( faker.location.longitude( ) ),
      observationPhotos: []
    } );
    expect( observation.id ).toBeTruthy();
    expect( observation.created_at ).toBeTruthy();
    useStore.setState( {
      observations: [observation],
      currentObservation: observation
    } );
    renderObsEdit( );

    expect(
      screen.getByText( new RegExp( `Lat: ${observation.latitude}` ) )
    ).toBeTruthy();

    await waitFor( () => undefined );

    expect( Geolocation.watchPosition ).not.toHaveBeenCalled();
  } );
} );
