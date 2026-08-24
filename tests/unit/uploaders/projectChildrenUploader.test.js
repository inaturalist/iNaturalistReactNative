import {
  filterDirtyOfvs,
  filterDirtyPos,
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

      it( "excludes tombstoned and empty OFVs", () => {
        const observation = {
          observationFieldValues: [
            {
              needsSync: () => true,
              _pending_deletion: true,
              value: "x",
            },
            {
              needsSync: () => true,
              _pending_deletion: false,
              value: "",
            },
            {
              needsSync: () => false,
              _pending_deletion: false,
              value: "y",
            },
          ],
        };
        expect( filterDirtyOfvs( observation ) ).toEqual( [] );
      } );
      describe( "filterDirtyPos", () => {
        it( "includes never-synced POs that need sync", () => {
          const po = {
            needsSync: () => true,
            _pending_deletion: false,
            wasSynced: () => false,
          };
          const observation = { projectObservations: [po] };
          expect( filterDirtyPos( observation ) ).toEqual( [po] );
        } );
      } );
    } );
  } );
} );
