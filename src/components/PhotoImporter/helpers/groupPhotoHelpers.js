// @flow

const sortByTime = array => array.sort( ( a, b ) => b.timestamp - a.timestamp );

const flattenAndOrderSelectedPhotos = ( selectedObservations: ?Object[] ): Object[] => {
  // combine selected observations into a single array
  let combinedPhotos = [];
  selectedObservations?.forEach( obs => {
    combinedPhotos = combinedPhotos.concat( obs.photos );
  } );

  // sort selected observations by timestamp and avoid duplicates
  return [...new Set( sortByTime( combinedPhotos ) )];
};

export default flattenAndOrderSelectedPhotos;
