function prepareMediaForUpload( item: Object ): Object {
  let currentEvidence = item;

  if ( currentEvidence.photo ) {
    currentEvidence = item.toJSON( );
    // Remove all null values, b/c the API doesn't seem to like them
    const newPhoto = {};
    const { photo } = currentEvidence;
    Object.keys( photo ).forEach( k => {
      if ( photo[k] !== null ) {
        newPhoto[k] = photo[k];
      }
    } );
    currentEvidence.photo = newPhoto;
  }
  return currentEvidence;
}

export default prepareMediaForUpload;
