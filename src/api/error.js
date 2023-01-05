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

const handleError = async ( e: Object, options: Object = {} ): Object => {
  if ( !e.response ) { throw e; }
  const errorText = await e.response.text( );
  const error = new INatApiError( errorText );
  console.error(
    `Error requesting ${e.response.url} (status: ${e.response.status}): ${errorText}`
  );
  if ( options.throw ) {
    throw error;
  }
};

export default handleError;
