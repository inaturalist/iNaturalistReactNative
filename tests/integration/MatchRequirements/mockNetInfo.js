// A NetInfo whose answer can change mid-test (global.mockNetwork.set), used as
//   jest.mock( "@react-native-community/netinfo",
//     ( ) => jest.requireActual( "./mockNetInfo" ).default( ) );
// Like the real library, useNetInfo is unknown (isConnected null) on a
// screen's first render and learns the state in an effect, and a new listener
// is handed the current state right away.
const makeMockNetInfo = ( ) => {
  const React = jest.requireActual( "react" );
  let state = {
    type: "wifi", isConnected: true, isInternetReachable: true, details: null,
  };
  const listeners = new Set( );
  global.mockNetwork = {
    set: next => {
      state = { ...state, ...next };
      listeners.forEach( listener => listener( state ) );
    },
  };
  const addEventListener = listener => {
    listeners.add( listener );
    listener( state );
    return ( ) => listeners.delete( listener );
  };
  const netInfo = {
    configure: jest.fn( ),
    fetch: jest.fn( async ( ) => state ),
    refresh: jest.fn( async ( ) => state ),
    addEventListener: jest.fn( addEventListener ),
    useNetInfo: ( ) => {
      const [current, setCurrent] = React.useState( {
        type: "unknown", isConnected: null, isInternetReachable: null, details: null,
      } );
      React.useEffect( ( ) => addEventListener( setCurrent ), [] );
      return current;
    },
  };
  return { __esModule: true, default: netInfo, ...netInfo };
};

export default makeMockNetInfo;
