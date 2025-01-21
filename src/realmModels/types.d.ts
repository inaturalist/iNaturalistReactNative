interface RealmObject {
  isValid: ( ) => boolean;
}

export interface RealmPhoto extends RealmObject {
  _created_at?: Date;
  _synced_at?: Date;
  _updated_at?: Date;
  id: number;
  attribution?: string;
  licenseCode?: string; // TODO type this with actual codes
  url?: string;
  localFilePath?: string;
}

export interface RealmSound extends RealmObject {
  _created_at?: Date;
  _synced_at?: Date;
  _updated_at?: Date;
  id: number;
  attribution?: string;
  licenseCode?: string; // TODO type this with actual codes
  file_url: string;
}

export interface RealmObservationPhoto extends RealmObject {
  originalPhotoUri?: string;
  photo: RealmPhoto;
}

export interface RealmObservationSound extends RealmObject {
  sound: RealmSound;
}

export interface RealmTaxon extends RealmObject {
  id: number;
  defaultPhoto?: RealmPhoto,
  name?: string;
  preferredCommonName?: string;
  rank?: string;
  rank_level?: number;
  isIconic?: boolean;
  iconic_taxon_name?: string;
  ancestor_ids?: number[];
  _synced_at?: Date;
}

export interface RealmObservation extends RealmObject {
  _created_at?: Date;
  _synced_at?: Date;
  captive_flag: boolean | null;
  description: string | null;
  geoprivacy: string | null;
  latitude: number | null;
  longitude: number | null;
  missingBasics: ( ) => boolean;
  needsSync: ( ) => boolean;
  observationPhotos: Array<RealmObservationPhoto>;
  observationSounds: Array<RealmObservationSound>;
  observed_on_string: string | null;
  owners_identification_from_vision: boolean | null;
  place_guess: string | null;
  positional_accuracy: number | null;
  species_guess: string | null;
  taxon_id: number | null;
  taxon?: RealmTaxon;
  uuid: string;
}

export interface RealmUser extends RealmObject {
  iconUrl?: string;
  iconUrl?: string;
  id: number;
  locale?: string;
  login?: string;
  name?: string;
  observations_count?: number;
  prefers_common_names?: boolean;
  prefers_community_taxa?: boolean;
  prefers_scientific_name_first?: boolean;
  signedIn?: boolean;
}
