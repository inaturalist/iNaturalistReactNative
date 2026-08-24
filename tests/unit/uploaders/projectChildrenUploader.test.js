import {
  filterDirtyOfvs,
} from "uploaders/projectChildrenUploader";

describe( "projectChildrenUploader", () => {
  describe( "filterDirtyOfvs", () => {
    it( "includes unsynced OFVs with a value", () => {
      const ofv = {
        needsSync: () => true,
        _pending_deletion: false,
        value: "shrubland",
      };
      const observation = { observationFieldValues: [ofv] };
      expect( filterDirtyOfvs( observation ) ).toEqual( [ofv] );
    } );
  } );
} );
