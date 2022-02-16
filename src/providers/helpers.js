// @flow

const USER_FIELDS = {
  icon_url: true,
  id: true,
  login: true,
  name: true
};

const TAXON_FIELDS = {
  default_photo: {
    url: true
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
  // $FlowFixMe
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

const MESSAGE_FIELDS = {
  subject: true,
  body: true,
  from_user: USER_FIELDS,
  to_user: USER_FIELDS
};

const FIELDS = {
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

export {
  FIELDS,
  MESSAGE_FIELDS
};
