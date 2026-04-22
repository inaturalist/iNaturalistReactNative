// Generic types, please keep alphabetized
export interface ApiOpts {
  api_token?: string;
}

export interface ApiParams {
  per_page?: number;
  page?: number;
  fields?: "all" | object;
  ttl?: number;
}

export interface ApiPlace {
  id?: number;
  name?: string;
  display_name?: string;
  place_type?: number;
}

export interface ApiProject {
  icon?: string;
  id?: number;
  project_type?: "collection" | "umbrella" | ""; // FYI "" means "traditional"
  title?: string;
}

export interface ApiResponse {
  total_results: number;
  page: number;
  per_page: number;
  results: object[];
}

export interface ApiObservationsUpdatesParams extends ApiParams {
  observations_by?: "owner" | "following";
}

// Model types, need to be ordered by reference

interface ApiAnnouncement {
  id: string;
  start: number;
  dismissible: boolean;
  body: string;
}

interface ApiFlag {
  id?: number;
}

interface ApiModeratorAction {
  id?: number;
}

interface ApiMedia {
  attribution?: string;
  flags?: ApiFlag[];
  hidden?: boolean;
  id?: number;
  license_code?: string;
  moderator_actions?: ApiModeratorAction[];
  uuid?: string;
}

interface ApiPhoto extends ApiMedia {
  original_dimensions?: {
    height?: number;
    width?: number;
  };
  url?: string;
}

interface ApiSound extends ApiMedia {
  file_content_type?: string;
  file_url?: string;
  native_sound_id?: number;
}

export interface ApiObservationPhoto {
  id?: number;
  photo?: ApiPhoto;
  position?: number;
  uuid?: string;
}

export interface ApiObservationSound {
  id?: number;
  sound?: ApiSound;
  position?: number;
  uuid?: string;
}

export interface ApiTaxon {
  default_photo?: ApiPhoto;
  representative_photo?: ApiPhoto;
  iconic_taxon_name?: string;
  id?: number;
  name?: string;
  preferred_common_name?: string;
  rank_level?: number;
  taxonPhotos?: { photo: ApiPhoto }[];
  defaultPhoto?: ApiPhoto;
}

export interface ApiRecord {
  created_at?: string;
  id?: number;
  updated_at?: string;
}

export interface ApiUser extends ApiRecord {
  description?: string;
  icon_url?: string;
  id?: number;
  identifications_count?: number;
  journal_posts_count?: number;
  locale?: string;
  login?: string;
  name?: string;
  observations_count?: number;
  prefers_no_tracking?: boolean;
  roles?: string[];
  site?: {
    id?: number;
    name?: string;
  };
  species_count?: number;
}

export interface ApiComment {
  body?: string;
  user?: ApiUser;
  id: number;
  hidden?: boolean;
  uuid: string;
  created_at: string;
}

export interface ApiIdentification {
  body?: string;
  taxon?: ApiTaxon;
  user?: ApiUser;
  hidden?: boolean;
}

export interface ApiNotification {
  comment?: ApiComment;
  comment_id?: number;
  created_at: string;
  id: number;
  identification?: ApiIdentification;
  identification_id?: number;
  notifier_type: string;
  resource_uuid: string;
  viewed?: boolean;
}

export interface ApiProjectObservation {
  project: ApiProject;
}

export interface ApiObservation extends ApiRecord {
  comments?: ApiComment[];
  identifications?: ApiIdentification[];
  non_traditional_projects?: ApiProjectObservation[];
  observation_photos?: ApiObservationPhoto[];
  observation_sounds?: ApiObservationSound[];
  project_observations?: ApiProjectObservation[];
  taxon?: ApiTaxon;
  time_observed_at?: string;
  user?: ApiUser;
  uuid: string;
}

export interface ApiRelationship extends ApiRecord {
  following?: boolean;
  // For some reason inaturalistjs is changing friend_user to friendUser on the fly.
  // https://github.com/inaturalist/inaturalistjs/blob/35534d90f67c4e724a5679a53e99a39cc167a8f5/lib/models/relationship.js#L7-L8
  friendUser?: {
    id?: number;
  };
}

export interface ApiSuggestion {
  taxon: ApiTaxon;
  combined_score: number;
}

export interface ApiObservationsSearchResponse extends ApiResponse {
  results: ApiObservation[];
}

export const ORDER_BY_CREATED_AT = "created_at";
export const ORDER_BY_GEO_SCORE = "geo_score";
export const ORDER_BY_ID = "id";
export const ORDER_BY_OBSERVED_ON = "observed_on";
export const ORDER_BY_RANDOM = "random";
export const ORDER_BY_SPECIES_GUESS = "species_guess";
export const ORDER_BY_UPDATED_AT = "updated_at";
export const ORDER_BY_VOTES = "votes";

export const ORDER_ASC = "asc";
export const ORDER_DESC = "desc";

export interface ApiObservationsSearchParams extends ApiParams {
  created_d1?: string;
  created_d2?: string;
  d1?: string;
  d2?: string;
  id_below?: number;
  order?: typeof ORDER_ASC | typeof ORDER_DESC;
  order_by?: typeof ORDER_BY_CREATED_AT |
    typeof ORDER_BY_GEO_SCORE |
    typeof ORDER_BY_ID |
    typeof ORDER_BY_OBSERVED_ON |
    typeof ORDER_BY_RANDOM |
    typeof ORDER_BY_SPECIES_GUESS |
    typeof ORDER_BY_UPDATED_AT |
    typeof ORDER_BY_VOTES;
  return_bounds?: boolean;
}
