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
        const testObs = observations[0];
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
      it( "should make a network request to retrieve the record", async ( ) => {
        const repo = new Repository( "Observation", global.realm );
        const uuid = "animals";
        const obs = await global.realm.objectForPrimaryKey( "Observation", uuid );
        expect( obs ).toBeUndefined( );
        const observations = [factory( "RemoteObservation" )];
        inatjs.observations.fetch.mockResolvedValue( makeResponse( observations ) );
        await repo.get( uuid );
        expect( inatjs.observations.fetch.mock.calls.length ).toEqual( 1 );
      } );
      it( "should insert the data into realm if not already present", async ( ) => {
        // check to see if data is already in realm
        const observations = [factory( "RemoteObservation" )];
        const repo = new Repository( "Observation", global.realm );
        const { uuid } = observations[0];
        const obs = await global.realm.objectForPrimaryKey( "Observation", uuid );
        expect( obs ).toBeUndefined( );
        // if undefined, fetch remote data
        const response = makeResponse( observations );
        inatjs.observations.fetch.mockResolvedValue( response );
        const { results } = response;
        // save remote data to realm
        await repo.post( results[0] );
        // check realm to see if record was saved
        const savedObs = await global.realm.objectForPrimaryKey( "Observation", uuid );
        expect( savedObs.uuid ).toBe( uuid );
      } );
      it( "should update the data into realm if already present", async ( ) => {
        // check to see if data is already in realm
        const observations = [factory( "RemoteObservation" )];
        const repo = new Repository( "Observation", global.realm );
        const { uuid } = observations[0];
        const obs = await global.realm.objectForPrimaryKey( "Observation", uuid );
        expect( obs ).toBeUndefined( );
        // if undefined, fetch remote data
        const response = makeResponse( observations );
        inatjs.observations.fetch.mockResolvedValue( response );
        const { results } = response;
        // save remote data to realm
        await repo.post( results[0] );
        // check realm to see if record was saved
        const savedObs = await global.realm.objectForPrimaryKey( "Observation", uuid );
        const originalLocalDescription = savedObs.description;
        expect( savedObs.uuid ).toBe( uuid );
        // update description for RemoteObservation
        const updatedDescription = "This obs was updated on the server";
        observations[0].description = updatedDescription;
        // fetch updated remote data
        const updatedResponse = makeResponse( observations );
        inatjs.observations.fetch.mockResolvedValue( updatedResponse );
        const updatedRecord = updatedResponse.results[0];
        // update data in realm
        await repo.patch( updatedRecord );
        // check description of updated record
        const updatedObs = await global.realm.objectForPrimaryKey( "Observation", uuid );
        expect( updatedObs.description ).toBe( updatedDescription );
        expect( originalLocalDescription ).not.toMatch( updatedObs.description );
      } );
    } );
  } );
} );
