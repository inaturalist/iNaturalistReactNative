// @flow

class INatApiError extends Error {
  // Object literal of the JSON body returned by the server
  json: Object;

  // HTTP status code of the server response
  status: number;

  constructor( json ) {
    super( JSON.stringify( json ) );
    this.json = json;
    this.status = json.status;
  }
}
// https://wbinnssmith.com/blog/subclassing-error-in-modern-javascript/
Object.defineProperty( INatApiError.prototype, "name", {
  value: "INatApiError"
} );

const handleError = async ( e: Object, options: Object = {} ) => {
  if ( !e.response ) { throw e; }
  const errorJson = await e.response.json( );
  const error = new INatApiError( errorJson );
  if ( options.throw ) {
    throw error;
  }
};

export default handleError;
