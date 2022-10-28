import { fetchRemoteObservation } from "api/observations";
import Observation from "realmModels/Observation";

import RepositoryNeedsRealmError from "./errors/RepositoryNeedsRealmError";

const MODELS = { Observation };

class Repository {
  static NEEDS_UPLOAD = "needs_upload";

  static UPLOADING = "uploading";

  static SYNCED = "synced";

  constructor( modelName, realm ) {
    if ( !realm || realm.isClosed ) {
      throw new RepositoryNeedsRealmError( );
    }
    this.modelName = modelName;
    this.model = MODELS[modelName];
    this.realm = realm;
    this.syncStatus = Repository.SYNCED;
  }

  async search( ) {
    return Array.from( this.realm.objects( this.modelName ) ).map( o => ( {
      ...o.toJSON( ),
      observationPhotos: Array.from( o.observationPhotos )
    } ) );
  }

  // new( options = {} ) {
  //   return this.model.new( options );
  // }

  async get( uuid ) {
    // fetch from realm
    const record = this.realm.objectForPrimaryKey( this.modelName, uuid );
    if ( !record ) {
      return fetchRemoteObservation( uuid );
    }
    /* Pseudocode
    if in realm
      deep convert to pojo
    else
      fetch from API
      insert into realm
      repeat
    */
    return record.toJSON( );
  }

  post( newRecord ) {
    // insert into realm
    this.realm.write( ( ) => {
      this.realm.create( this.modelName, newRecord );
    } );
  }

  patch( updatedRecord ) {
    // using realm upsert function, which will automatically create
    // a new record with given primary key if it doesn't exist already
    // and update in realm if the record exists
    this.realm.write( ( ) => {
      this.realm.create( this.modelName, updatedRecord, "modified" );
    } );
  }

  /* Pseudocode
  patch( modelInstance ) {
    raise error if not in realm
    udpate in realm
  }

  delete( uuid ) {
    if in realm
      mark as needing deletion
  }
  */
}

export { RepositoryNeedsRealmError };
export default Repository;
