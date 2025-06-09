let mockShareData = null;
let mockListeners = [];

const ShareMenu = {
  getInitialShare: jest.fn( callback => {
    if ( mockShareData ) {
      callback( mockShareData );
    }
  } ),

  addNewShareListener: jest.fn( callback => {
    const listener = { callback, remove: jest.fn() };
    mockListeners.push( listener );
    return listener;
  } ),

  __setMockShareData: data => {
    mockShareData = data;
  },

  __triggerNewShare: data => {
    mockListeners.forEach( listener => listener.callback( data ) );
  },

  __reset: ( ) => {
    mockShareData = null;
    mockListeners = [];
  }
};

export default ShareMenu;
