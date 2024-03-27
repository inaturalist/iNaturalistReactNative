const createExploreSlice = set => ( {
  rootExploreParams: {},
  setRootExploreParams: params => set( ( ) => ( { rootExploreParams: params } ) )
} );

export default createExploreSlice;
