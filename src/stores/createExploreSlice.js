const createExploreSlice = set => ( {
  storedParams: {},
  setStoredParams: params => set( ( ) => ( { storedParams: params } ) )
} );

export default createExploreSlice;
