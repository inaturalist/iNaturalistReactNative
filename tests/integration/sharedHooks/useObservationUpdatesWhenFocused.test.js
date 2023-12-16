import { renderHook } from "@testing-library/react-native";
import useObservationUpdatesWhenFocused from "sharedHooks/useObservationUpdatesWhenFocused";
import factory from "tests/factory";

jest.mock( "react-native/Libraries/AppState/AppState", () => ( {
  addEventListener: jest.fn( ( event, callback ) => {
    callback( "active" );
  } )
} ) );

const mockObservations = [
  factory( "LocalObservation", { comments_viewed: false, identifications_viewed: false } ),
  factory( "LocalObservation", { comments_viewed: true, identifications_viewed: false } ),
  factory( "LocalObservation", { comments_viewed: false, identifications_viewed: true } ),
  factory( "LocalObservation", { comments_viewed: true, identifications_viewed: true } )
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
      expect( o.comments_viewed ).toBe( true );
      expect( o.identifications_viewed ).toBe( true );
    } );
  } );
} );
