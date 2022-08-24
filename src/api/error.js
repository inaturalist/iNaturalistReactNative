// @flow

const handleError = async ( e: Object ) => {
  if ( !e.response ) { throw e; }
  const errorJson = await e.response.json( );
  const error = new Error( errorJson.status );
  throw error;
};

export default handleError;
