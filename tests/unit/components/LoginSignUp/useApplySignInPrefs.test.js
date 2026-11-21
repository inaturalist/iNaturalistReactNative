import { act, renderHook } from "@testing-library/react-native";
import useApplySignInPrefs, {
  AUTO_ADVANCED_MODE_OBSERVATION_THRESHOLD,
} from "components/LoginSignUp/useApplySignInPrefs";
import useStore from "stores/useStore";

const applySignInPrefs = observationsCount => {
  const { result } = renderHook( ( ) => useApplySignInPrefs( ) );
  act( ( ) => result.current( observationsCount ) );
};

describe( "useApplySignInPrefs", ( ) => {
  beforeEach( ( ) => {
    act( ( ) => {
      useStore.getState( ).layout.setIsDefaultMode( true );
      useStore.setState( { loggedInWhileInDefaultMode: undefined } );
    } );
  } );

  it( "switches to advanced mode for a user with at least the threshold of observations", ( ) => {
    applySignInPrefs( AUTO_ADVANCED_MODE_OBSERVATION_THRESHOLD );
    expect( useStore.getState( ).layout.isDefaultMode ).toBe( false );
  } );

  it.each( [
    ["just under the threshold", AUTO_ADVANCED_MODE_OBSERVATION_THRESHOLD - 1],
    ["no observations count", undefined],
  ] )( "stays in default mode and records it for a user with %s", ( _case, count ) => {
    applySignInPrefs( count );
    expect( useStore.getState( ).layout.isDefaultMode ).toBe( true );
    expect( useStore.getState( ).loggedInWhileInDefaultMode ).toBe( true );
  } );
} );
