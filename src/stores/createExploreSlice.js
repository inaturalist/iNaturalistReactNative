const createExploreSlice = set => ( {
  storedParams: {},
  setStoredParams: params => set( ( ) => ( { storedParams: params } ) ),
  exploreView: "observations",
  setExploreView: exploreView => set( ( ) => ( {
    exploreView
  } ) )
} );

export default createExploreSlice;
