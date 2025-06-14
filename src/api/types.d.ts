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
}

export interface ApiUser {
  icon_url?: string;
  id?: number;
  locale?: string;
  login?: string;
}

export interface ApiComment {
  body?: string;
  user?: ApiUser;
}

export interface ApiIdentification {
  body?: string;
  taxon?: ApiTaxon;
  user?: ApiUser;
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

export interface ApiRecord {
  created_at?: string;
  id?: number;
  updated_at?: string;
}

export interface ApiObservation extends ApiRecord {
  observation_photos?: ApiObservationPhoto[];
  observation_sounds?: ApiObservationSound[];
  time_observed_at?: string;
  user?: ApiUser;
  uuid: string;
}

export interface ApiObservationsSearchResponse extends ApiResponse {
  results: ApiObservation[]
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
