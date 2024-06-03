export default filterLocalObservationsToDelete = realm => {
  // currently sorting so oldest observations to delete are first
  const observationsFlaggedForDeletion = realm
    .objects( "Observation" ).filtered( "_deleted_at != nil" ).sorted( "_deleted_at", false );

  return observationsFlaggedForDeletion.map( obs => obs.toJSON( ) );
};
