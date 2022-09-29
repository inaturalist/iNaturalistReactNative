import Repository from "../../src/components/RepositoryTest/Repository";
import factory from "../factory";

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
      it.todo( "should make a network request to retrieve the record" );
      it.todo( "should insert the data into realm if not already present" );
      it.todo( "should update the data into realm if already present" );
    } );
  } );
} );
