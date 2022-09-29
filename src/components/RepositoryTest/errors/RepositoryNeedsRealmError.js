class RepositoryNeedsRealmError extends Error {
  constructor( ) {
    super( "Repository must be instantiated with a working Realm connection" );
  }
}

Object.defineProperty( RepositoryNeedsRealmError.prototype, "name", {
  value: "RepositoryNeedsRealmError"
} );

export default RepositoryNeedsRealmError;
