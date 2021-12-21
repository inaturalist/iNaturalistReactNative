// @flow
import Comment from "../models/Comment";
import Identification from "../models/Identification";
import ObservationPhoto from "../models/ObservationPhoto";
import Taxon from "../models/Taxon";

const USER_FIELDS = {
  icon_url: true,
  id: true,
  login: true,
  name: true
};

const TAXON_FIELDS = {
  default_photo: {
    square_url: true
  },
  iconic_taxon_name: true,
  name: true,
  preferred_common_name: true,
  rank: true,
  rank_level: true
};

const ID_FIELDS = {
  body: true,
  category: true,
  created_at: true,
  current: true,
  disagreement: true,
  taxon: TAXON_FIELDS,
  updated_at: true,
  user: Object.assign( { }, USER_FIELDS, { id: true } ),
  uuid: true,
  vision: true
};

const PHOTO_FIELDS = {
  id: true,
  attribution: true,
  license_code: true,
  url: true
};

const COMMENT_FIELDS = {
  body: true,
  created_at: true,
  id: true,
  user: USER_FIELDS
};

const OBSERVATION_PHOTOS_FIELDS = {
  id: true,
  photo: PHOTO_FIELDS,
  position: true,
  uuid: true
};

const FIELDS = {
  comments_count: true,
  comments: COMMENT_FIELDS,
  created_at: true,
  description: true,
  geojson: true,
  identifications: ID_FIELDS,
  latitude: true,
  location: true,
  longitude: true,
  observation_photos: OBSERVATION_PHOTOS_FIELDS,
  place_guess: true,
  quality_grade: true,
  taxon: TAXON_FIELDS,
  time_observed_at: true,
  user: USER_FIELDS
};

const copyRealmSchema = ( obs: Object ) => {
  const createLinkedObjects = ( list, createFunction ) => {
    if ( list.length === 0 ) { return; }
    return list.map( item => {
      return createFunction.mapApiToRealm( item );
    } );
  };

  const taxon = Taxon.mapApiToRealm( obs.taxon );
  const observationPhotos = createLinkedObjects( obs.observation_photos, ObservationPhoto );
  const comments = createLinkedObjects( obs.comments, Comment );
  const identifications = createLinkedObjects( obs.identifications, Identification );

  return {
    uuid: obs.uuid,
    comments: comments || [],
    createdAt: obs.created_at,
    description: obs.description,
    identifications: identifications || [],
    latitude: obs.geojson ? obs.geojson.coordinates[1] : null,
    longitude: obs.geojson ? obs.geojson.coordinates[0] : null,
    observationPhotos,
    placeGuess: obs.place_guess,
    qualityGrade: obs.quality_grade,
    taxon,
    timeObservedAt: obs.time_observed_at
  };
};

export {
  FIELDS,
  copyRealmSchema
};
