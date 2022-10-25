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

  get( uuid ) {
    // fetch from realm
    const record = this.realm.objectForPrimaryKey( this.modelName, uuid );
    if ( !record ) return null;
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

  /* Pseudocode
  post( modelInstance ) {
   // insert into realm
  }

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
