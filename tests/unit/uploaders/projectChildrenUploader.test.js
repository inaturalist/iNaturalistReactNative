import * as observationFieldValuesApi from "api/observationFieldValues";
import factory, { makeResponse } from "tests/factory";
import { markRecordUploaded } from "uploaders";
import {
  filterDirtyOfvs,
  filterDirtyPos,
  uploadProjectChildren,
} from "uploaders/projectChildrenUploader";

jest.mock( "api/observationFieldValues" );
jest.mock( "uploaders" );

const mockOpts = { api_token: "test-token", signal: new AbortController().signal };
let mockRealm;

const dirtyOfv = ( overrides = {} ) => factory( "LocalObservationFieldValue", {
  id: null,
  needsSync: jest.fn( () => true ),
  wasSynced: jest.fn( () => false ),
  _pending_deletion: false,
  ...overrides,
} );

const dirtyPo = ( overrides = {} ) => factory( "LocalProjectObservation", {
  needsSync: jest.fn( () => true ),
  wasSynced: jest.fn( () => false ),
  _pending_deletion: false,
  ...overrides,
} );

beforeEach( () => {
  jest.clearAllMocks();
  mockRealm = { isClosed: false };
  observationFieldValuesApi.createObservationFieldValue.mockResolvedValue(
    makeResponse( [{ id: 101 }] ),
  );
  observationFieldValuesApi.updateObservationFieldValue.mockResolvedValue(
    makeResponse( [{ id: 102 }] ),
  );
} );

describe( "projectChildrenUploader", () => {
  describe( "filterDirtyOfvs", () => {
    it( "includes unsynced OFVs with a value", () => {
      const ofv = dirtyOfv( { value: "shrubland" } );
      const observation = factory( "LocalObservation", {
        observationFieldValues: [ofv],
      } );
      expect( filterDirtyOfvs( observation ) ).toEqual( [ofv] );
    } );

    it( "excludes tombstoned and empty OFVs", () => {
      const observation = factory( "LocalObservation", {
        observationFieldValues: [
          dirtyOfv( { _pending_deletion: true, value: "x" } ),
          dirtyOfv( { value: "" } ),
          dirtyOfv( { needsSync: jest.fn( () => false ), value: "y" } ),
        ],
      } );
      expect( filterDirtyOfvs( observation ) ).toEqual( [] );
    } );
  } );

  describe( "filterDirtyPos", () => {
    it( "includes never-synced POs that need sync", () => {
      const po = dirtyPo( );
      const observation = factory( "LocalObservation", {
        projectObservations: [po],
      } );
      expect( filterDirtyPos( observation ) ).toEqual( [po] );
    } );

    it( "excludes tombstoned and already-synced POs", () => {
      const observation = factory( "LocalObservation", {
        projectObservations: [
          dirtyPo( { _pending_deletion: true } ),
          dirtyPo( { wasSynced: jest.fn( () => true ) } ),
        ],
      } );
      expect( filterDirtyPos( observation ) ).toEqual( [] );
    } );
  } );

  describe( "uploadProjectChildren", () => {
    it( "POSTs multiple dirty OFVs in parallel", async () => {
      const ofvOne = dirtyOfv( {
        uuid: "ofv-uuid-1",
        obsFieldId: 10,
        value: "male",
      } );
      const ofvTwo = dirtyOfv( {
        uuid: "ofv-uuid-2",
        obsFieldId: 20,
        value: "shrubland",
      } );
      const observation = factory( "LocalObservation", {
        uuid: "obs-uuid",
        observationFieldValues: [ofvOne, ofvTwo],
        projectObservations: [],
      } );

      await uploadProjectChildren( "obs-uuid", observation, mockOpts, mockRealm );

      expect( observationFieldValuesApi.createObservationFieldValue ).toHaveBeenCalledTimes( 2 );
      expect( observationFieldValuesApi.createObservationFieldValue ).toHaveBeenCalledWith(
        {
          observation_field_value: {
            observation_id: "obs-uuid",
            observation_field_id: 10,
            value: "male",
          },
        },
        mockOpts,
      );
      expect( observationFieldValuesApi.createObservationFieldValue ).toHaveBeenCalledWith(
        {
          observation_field_value: {
            observation_id: "obs-uuid",
            observation_field_id: 20,
            value: "shrubland",
          },
        },
        mockOpts,
      );
      expect( markRecordUploaded ).toHaveBeenCalledTimes( 2 );
    } );

    it( "PUTs OFVs that were previously synced", async () => {
      const ofv = dirtyOfv( {
        uuid: "ofv-uuid",
        obsFieldId: 10,
        value: "female",
        id: 55,
        wasSynced: jest.fn( () => true ),
      } );
      const observation = factory( "LocalObservation", {
        uuid: "obs-uuid",
        observationFieldValues: [ofv],
        projectObservations: [],
      } );

      await uploadProjectChildren( "obs-uuid", observation, mockOpts, mockRealm );

      expect( observationFieldValuesApi.updateObservationFieldValue ).toHaveBeenCalledWith(
        {
          id: "ofv-uuid",
          observation_field_value: {
            observation_id: "obs-uuid",
            observation_field_id: 10,
            value: "female",
          },
        },
        mockOpts,
      );
      expect( observationFieldValuesApi.createObservationFieldValue ).not.toHaveBeenCalled();
    } );
  } );
} );
