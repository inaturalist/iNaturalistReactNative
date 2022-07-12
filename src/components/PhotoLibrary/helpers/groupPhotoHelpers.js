// @flow

const sortByTime = array => array.sort( ( a, b ) => b.timestamp - a.timestamp );

const orderByTimestamp = (
  albums: Array<Object>,
  selectedPhotos: Array<Object>
): Array<Object> => {
  let unorderedPhotos = [];
  albums.forEach( album => {
    unorderedPhotos = unorderedPhotos.concat( selectedPhotos[album] );
  } );

  // sort photos from all albums by time
  const ordered = sortByTime( unorderedPhotos );

  // nest under photos
  return ordered.map( photo => ( {
    photos: [photo]
  } ) );
};

const flattenAndOrderSelectedPhotos = ( selectedObservations: ?Array<Object> ): Array<Object> => {
  // combine selected observations into a single array
  let combinedPhotos = [];
  selectedObservations?.forEach( obs => {
    combinedPhotos = combinedPhotos.concat( obs.photos );
  } );

  // sort selected observations by timestamp and avoid duplicates
  return [...new Set( sortByTime( combinedPhotos ) )];
};

export {
  flattenAndOrderSelectedPhotos,
  orderByTimestamp
};
