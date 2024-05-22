export default filterLocalObservationsToDelete = realm => {
  const deletions = [];
  // currently sorting so oldest observations to delete are first
  const observationsFlaggedForDeletion = realm
    .objects( "Observation" ).filtered( "_deleted_at != nil" ).sorted( "_deleted_at", false );

  deletions.concat( observationsFlaggedForDeletion.map( obs => obs.toJSON( ) ) );
  return deletions;
};
