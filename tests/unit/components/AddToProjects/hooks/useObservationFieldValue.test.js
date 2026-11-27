import { act, renderHook } from "@testing-library/react-native";
import useObservationFieldValue from "components/AddToProjects/hooks/useObservationFieldValue";
import Observation from "realmModels/Observation";
import useStore from "stores/useStore";

const initialStoreState = useStore.getState( );

describe( "useObservationFieldValue", ( ) => {
  describe( "for a new observation", ( ) => {
    beforeEach( async ( ) => {
      useStore.setState( initialStoreState, true );
      useStore.setState( { currentObservation: await Observation.new( ) } );
    } );

    it( "returns an empty value", ( ) => {
      const { result } = renderHook( ( ) => useObservationFieldValue( 10 ) );

      expect( result.current.value ).toBe( "" );
    } );

    it( "creates an observation field value when a value is set", ( ) => {
      const { result } = renderHook( ( ) => useObservationFieldValue( 10 ) );

      act( ( ) => result.current.setValue( "monarch" ) );

      expect( useStore.getState( ).currentObservation.observationFieldValues ).toEqual( [
        expect.objectContaining( { obsFieldId: 10, value: "monarch" } ),
      ] );
    } );
  } );
} );
