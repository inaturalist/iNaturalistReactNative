import Repository from "components/RepositoryTest/Repository";
import inatjs from "inaturalistjs";

import factory, { makeResponse } from "../factory";

// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );

describe( "Repository", ( ) => {
  it( "should throw an error without Realm", ( ) => {
    expect( () => new Repository( "Observation" ) ).toThrow( );
  } );

  describe( "with local data", ( ) => {
    const observations = [
      factory( "LocalObservation" ),
      factory( "LocalObservation" )
    ];

    beforeAll( ( ) => {
      global.realm.write( ( ) => {
        observations.forEach( obs => {
          global.realm.create( "Observation", obs, "modified" );
        } );
      } );
    } );

    describe( "search", ( ) => {
      it( "should return an array", async ( ) => {
        const repo = new Repository( "Observation", global.realm );
        const results = await repo.search( );
        expect( results.length ).toEqual( observations.length );
      } );
    } );

    describe( "get", ( ) => {
      it( "should return an object", async ( ) => {
        const repo = new Repository( "Observation", global.realm );
        const remoteObservations = [factory( "RemoteObservation" )];
        const testObs = remoteObservations[0];
        inatjs.observations.fetch.mockResolvedValue( makeResponse( remoteObservations ) );
        const obs = await repo.get( testObs.uuid );
        expect( obs.uuid ).toEqual( testObs.uuid );
      } );
    } );

    describe( "create", ( ) => {
      it.todo( "should create a new record in Realm" );
      it.todo( "should mark a record as needing to be uploaded to the server" );
      it.todo( "should change repository sync status to NEEDS_UPLOAD" );
      it.todo( "should increment repository.uploadStatus.total" );
    } );

    describe( "patch", ( ) => {
      it.todo( "should update a record in Realm" );
      it.todo( "should mark a record as needing to be synced with the server" );
      it.todo( "should change repository sync status to NEEDS_UPLOAD" );
    } );

    describe( "delete", ( ) => {
      it.todo( "should remove the record from Realm" );
      it.todo( "should add a record to Realm stating that this needs to be deleted on the server" );
    } );

    describe( "upload", ( ) => {
      it.todo( "should change repository sync status to UPLOADING" );
      it.todo( "should make a POST request if there is a newly created record" );
      it.todo( "calls syncRecord at least once" );
      it.todo( "should set repository.uploadStatus.total to 0 when complete" );
    } );

    describe( "syncRecord", ( ) => {
      it.todo( "should make a POST request for a new record" );
      describe( "when the network request succeeds", ( ) => {
        it.todo( "should mark the record as synced" );
        it.todo( "should increment repository.uploadStatus.completed" );
      } );
      it.todo( "should store an error response when the network request fails" );
    } );
  } );

  describe( "with remote data", ( ) => {
    describe( "get", ( ) => {
      const remoteObservation = factory( "RemoteObservation" );
      const mockObsResponse = makeResponse( [remoteObservation] );

      beforeEach( ( ) => {
        global.realm.write( ( ) => {
          global.realm.deleteAll( );
        } );
        jest.clearAllMocks( );
        inatjs.observations.fetch.mockResolvedValue( mockObsResponse );
      } );

      it( "should make a network request to retrieve the record", async ( ) => {
        const repo = new Repository( "Observation", global.realm );
        const existingObs = await global.realm.objectForPrimaryKey(
          "Observation",
          remoteObservation.uuid
        );
        expect( existingObs ).toBeUndefined( );
        await repo.get( remoteObservation.uuid );
        expect( inatjs.observations.fetch.mock.calls.length ).toEqual( 1 );
      } );

      it( "should insert the data into realm if not already present", async ( ) => {
        const repo = new Repository( "Observation", global.realm );
        // check to see if data is already in realm
        const existingObservation = await global.realm.objectForPrimaryKey(
          "Observation",
          remoteObservation.uuid
        );
        expect( existingObservation ).toBeUndefined( );
        // make sure get( ) is fetching a remote observation and storing in realm
        const localObservation = await repo.get( remoteObservation.uuid );
        expect( inatjs.observations.fetch.mock.calls.length ).toEqual( 1 );
        expect( localObservation.uuid ).toBe( remoteObservation.uuid );
      } );

      // TODO this should probably update the data in realm *after* returning the local value
      it( "should update the data into realm if already present", async ( ) => {
        const repo = new Repository( "Observation", global.realm );
        const remoteDescription = remoteObservation.description;
        const localObservation = await repo.get( remoteObservation.uuid );
        expect( inatjs.observations.fetch.mock.calls.length ).toEqual( 1 );
        expect( localObservation.description ).toBe( remoteDescription );
        // update description of observation on server
        const updatedDescription = "This obs was updated on the server";
        const updatedRemoteObservation = factory( "RemoteObservation", {
          uuid: remoteObservation.uuid,
          description: updatedDescription
        } );
        const updatedResponse = makeResponse( [updatedRemoteObservation] );
        jest.clearAllMocks( );
        inatjs.observations.fetch.mockResolvedValue( updatedResponse );
        // fetch record from realm and make sure it's updated with latest remote data
        const updatedRecord = await repo.get( remoteObservation.uuid );
        expect( inatjs.observations.fetch.mock.calls.length ).toEqual( 1 );
        expect( updatedRecord.description ).toBe( updatedDescription );
      } );
    } );
  } );
} );
