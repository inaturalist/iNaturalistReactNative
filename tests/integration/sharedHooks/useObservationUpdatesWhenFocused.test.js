import { renderHook } from "@testing-library/react-native";
import useObservationUpdatesWhenFocused from "sharedHooks/useObservationUpdatesWhenFocused";

import factory from "../../factory";

jest.mock( "react-native/Libraries/AppState/AppState", () => ( {
  addEventListener: jest.fn( ( event, callback ) => {
    callback( "active" );
  } )
} ) );

const mockObservations = [
  factory( "LocalObservation", { viewed_comments: false, viewed_identifications: false } ),
  factory( "LocalObservation", { viewed_comments: true, viewed_identifications: false } ),
  factory( "LocalObservation", { viewed_comments: false, viewed_identifications: true } ),
  factory( "LocalObservation", { viewed_comments: true, viewed_identifications: true } )
];

describe( "useObservationUpdatesWhenFocused", () => {
  beforeAll( async () => {
    // Write mock observations to realm
    await global.realm.write( () => {
      mockObservations.forEach( o => {
        global.realm.create( "Observation", o );
      } );
    } );
  } );

  it( "should reset state of all observations in realm", () => {
    renderHook( () => useObservationUpdatesWhenFocused() );
    const observations = global.realm.objects( "Observation" );
    observations.forEach( o => {
      expect( o.viewed_comments ).toBe( true );
      expect( o.viewed_identifications ).toBe( true );
    } );
  } );
} );
