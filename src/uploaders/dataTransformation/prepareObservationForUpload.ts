import Observation from "realmModels/Observation";

function prepareObservationForUpload( obs: object ): object {
  const obsToUpload = Observation.mapObservationForUpload( obs );

  // Remove all null values, b/c the API doesn't seem to like them for some
  // reason (might be an error with the API as of 20220801)
  const preparedObs = {};
  Object.keys( obsToUpload ).forEach( key => {
    if ( obsToUpload[key] !== null ) {
      preparedObs[key] = obsToUpload[key];
    }
  } );

  return preparedObs;
}

export default prepareObservationForUpload;
