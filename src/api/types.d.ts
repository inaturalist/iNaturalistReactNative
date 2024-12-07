// Generic types, please keep alphabetized
export interface ApiOpts {
  api_token?: string;
}

export interface ApiParams {
  per_page?: number;
  page?: number;
  fields?: "all" | Object;
  ttl?: number;
}

export interface ApiPlace {
  id?: number;
  name?: string;
}

export interface ApiProject {
  id?: number;
  title?: string;
}

export interface ApiResponse {
  total_results: number;
  page: number;
  per_page: number;
  results: Object[];
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
  iconic_taxon_name?: string;
  id?: number;
  name?: string;
  preferred_common_name?: string;
}

export interface ApiUser {
  id?: number;
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

export interface ApiObservation {
  observation_photos?: ApiObservationPhoto[];
  observation_sounds?: ApiObservationSound[];
  user?: ApiUser;
  uuid: string;
}
