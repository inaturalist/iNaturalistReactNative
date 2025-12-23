export default ( {
  getCurrentPosition: jest.fn( ),
  watchPosition: jest.fn( ( ) => 0 ),
  clearWatch: jest.fn( ),
  setRNConfiguration: jest.fn( ( ) => ( {
    skipPermissionRequests: true,
  } ) ),
} );
