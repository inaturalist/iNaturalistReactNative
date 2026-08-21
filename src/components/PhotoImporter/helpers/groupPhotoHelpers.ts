import type { GroupedPhoto } from "stores/createObservationFlowSlice";

type GroupedPhotoItems = GroupedPhoto["photos"]

const sortByTime = (
  array: GroupedPhotoItems,
) => array.sort( ( a, b ) => b.timestamp - a.timestamp );

const flattenAndOrderSelectedPhotos = (
  selectedObservations: GroupedPhoto[],
) => {
  // combine selected observations into a single array
  let combinedPhotos: GroupedPhotoItems = [];
  selectedObservations?.forEach( obs => {
    combinedPhotos = combinedPhotos.concat( obs.photos );
  } );

  // sort selected observations by timestamp and avoid duplicates
  return [...new Set( sortByTime( combinedPhotos ) )];
};

export default flattenAndOrderSelectedPhotos;
