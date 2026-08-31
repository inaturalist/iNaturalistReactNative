import { INatApiError } from "api/error";
import * as observationFieldValuesApi from "api/observationFieldValues";
import * as projectObservationsApi from "api/projectObservations";
import factory from "tests/factory";
import syncProjectChildDeletions from "uploaders/projectChildrenDeleter";

jest.mock( "api/observationFieldValues" );
jest.mock( "api/projectObservations" );

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

const createMockRealm = ( ) => ( {
  isClosed: false,
  isInTransaction: false,
  beginTransaction: jest.fn( ),
  commitTransaction: jest.fn( ),
  cancelTransaction: jest.fn( ),
  delete: jest.fn( ),
} );

beforeEach( () => {
  jest.clearAllMocks();
  mockRealm = createMockRealm( );
  observationFieldValuesApi.deleteObservationFieldValue.mockResolvedValue( {} );
  projectObservationsApi.deleteProjectObservation.mockResolvedValue( {} );
} );

describe( "projectChildrenDeleter", () => {
  describe( "syncProjectChildDeletions", () => {
    it( "only DELETEs tombstoned embeds", async () => {
      const tombstonedPo = dirtyPo( {
        uuid: "po-delete-uuid",
        wasSynced: jest.fn( () => true ),
        _pending_deletion: true,
      } );
      const activePo = dirtyPo( {
        uuid: "po-active-uuid",
        wasSynced: jest.fn( () => true ),
      } );
      const tombstonedOfv = dirtyOfv( {
        uuid: "ofv-delete-uuid",
        wasSynced: jest.fn( () => true ),
        _pending_deletion: true,
        value: "old",
      } );
      const activeOfv = dirtyOfv( {
        uuid: "ofv-active-uuid",
        wasSynced: jest.fn( () => true ),
        value: "current",
      } );
      const observation = factory( "LocalObservation", {
        projectObservations: [activePo, tombstonedPo],
        observationFieldValues: [activeOfv, tombstonedOfv],
      } );

      await syncProjectChildDeletions( observation, mockOpts, mockRealm );

      expect( projectObservationsApi.deleteProjectObservation ).toHaveBeenCalledTimes( 1 );
      expect( projectObservationsApi.deleteProjectObservation ).toHaveBeenCalledWith(
        "po-delete-uuid",
        mockOpts,
      );
      expect( observationFieldValuesApi.deleteObservationFieldValue ).toHaveBeenCalledTimes( 1 );
      expect( observationFieldValuesApi.deleteObservationFieldValue ).toHaveBeenCalledWith(
        "ofv-delete-uuid",
        mockOpts,
      );
      expect( mockRealm.delete ).toHaveBeenCalledTimes( 2 );
      expect( mockRealm.delete ).toHaveBeenCalledWith( tombstonedPo );
      expect( mockRealm.delete ).toHaveBeenCalledWith( tombstonedOfv );
    } );

    it( "DELETEs tombstoned POs before OFVs and removes local embeds", async () => {
      const tombstonedPo = dirtyPo( {
        uuid: "po-delete-uuid",
        id: 99,
        wasSynced: jest.fn( () => true ),
        _pending_deletion: true,
      } );
      const tombstonedOfv = dirtyOfv( {
        uuid: "ofv-delete-uuid",
        id: 88,
        wasSynced: jest.fn( () => true ),
        _pending_deletion: true,
        value: "old",
      } );
      const observation = factory( "LocalObservation", {
        projectObservations: [tombstonedPo],
        observationFieldValues: [tombstonedOfv],
      } );

      await syncProjectChildDeletions( observation, mockOpts, mockRealm );

      expect( projectObservationsApi.deleteProjectObservation ).toHaveBeenCalledWith(
        "po-delete-uuid",
        mockOpts,
      );
      expect( observationFieldValuesApi.deleteObservationFieldValue ).toHaveBeenCalledWith(
        "ofv-delete-uuid",
        mockOpts,
      );
      expect(
        projectObservationsApi.deleteProjectObservation.mock.invocationCallOrder[0],
      ).toBeLessThan(
        observationFieldValuesApi.deleteObservationFieldValue.mock.invocationCallOrder[0],
      );
      expect( mockRealm.delete ).toHaveBeenCalledTimes( 2 );
      expect( mockRealm.delete ).toHaveBeenCalledWith( tombstonedPo );
      expect( mockRealm.delete ).toHaveBeenCalledWith( tombstonedOfv );
    } );

    it( "treats 404 and 403 as success and still removes local embeds", async () => {
      const tombstonedPo = dirtyPo( {
        uuid: "po-delete-uuid",
        wasSynced: jest.fn( () => true ),
        _pending_deletion: true,
      } );
      const tombstonedOfv = dirtyOfv( {
        uuid: "ofv-delete-uuid",
        wasSynced: jest.fn( () => true ),
        _pending_deletion: true,
        value: "old",
      } );
      const observation = factory( "LocalObservation", {
        projectObservations: [tombstonedPo],
        observationFieldValues: [tombstonedOfv],
      } );

      projectObservationsApi.deleteProjectObservation.mockRejectedValue(
        new INatApiError( { error: "Not found" }, 404 ),
      );
      observationFieldValuesApi.deleteObservationFieldValue.mockRejectedValue(
        new INatApiError( { error: "Forbidden" }, 403 ),
      );

      await syncProjectChildDeletions( observation, mockOpts, mockRealm );

      expect( mockRealm.delete ).toHaveBeenCalledTimes( 2 );
    } );

    it( "throws on other delete errors and does not remove local embeds", async () => {
      const tombstonedPo = dirtyPo( {
        uuid: "po-delete-uuid",
        wasSynced: jest.fn( () => true ),
        _pending_deletion: true,
      } );
      const observation = factory( "LocalObservation", {
        projectObservations: [tombstonedPo],
        observationFieldValues: [],
      } );

      projectObservationsApi.deleteProjectObservation.mockRejectedValue(
        new INatApiError( { error: "Server error" }, 500 ),
      );

      await expect(
        syncProjectChildDeletions( observation, mockOpts, mockRealm ),
      ).rejects.toThrow( INatApiError );
      expect( mockRealm.delete ).not.toHaveBeenCalled( );
    } );

    it( "skips remote DELETE for never-synced tombstones but removes locally", async () => {
      const tombstonedPo = dirtyPo( {
        uuid: "po-delete-uuid",
        wasSynced: jest.fn( () => false ),
        _pending_deletion: true,
      } );
      const observation = factory( "LocalObservation", {
        projectObservations: [tombstonedPo],
        observationFieldValues: [],
      } );

      await syncProjectChildDeletions( observation, mockOpts, mockRealm );

      expect( projectObservationsApi.deleteProjectObservation ).not.toHaveBeenCalled( );
      expect( mockRealm.delete ).toHaveBeenCalledWith( tombstonedPo );
    } );
  } );
} );
