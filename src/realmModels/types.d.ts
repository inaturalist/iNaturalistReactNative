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

export interface RealmObservationPhotoPojo extends RealmObject {
  uuid: string;
  originalPhotoUri?: string;
  photo: RealmPhoto;
  position?: number;
}

export interface RealmObservationPhoto extends RealmObservationPhotoPojo {
  needsSync: ( ) => boolean;
  wasSynced: ( ) => boolean;
}

export interface RealmObservationSoundPojo extends RealmObject {
  sound: RealmSound;
}

export interface RealmObservationSound extends RealmObject {
  needsSync: ( ) => boolean;
  wasSynced: ( ) => boolean;
}

export interface RealmTaxonPhoto extends RealmObject {
  _created_at?: Date;
  _synced_at?: Date;
  _updated_at?: Date;
  id: number;
  photo: RealmPhoto;
}

export interface RealmTaxon extends RealmObject {
  id: number;
  defaultPhoto?: RealmPhoto;
  name?: string;
  preferredCommonName?: string;
  rank?: string;
  rank_level?: number;
  isIconic?: boolean;
  iconic_taxon_name?: string;
  ancestor_ids?: number[];
  _synced_at?: Date;
  taxonPhotos?: RealmTaxonPhoto[];
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

interface RealmComment extends RealmObject {
  user: RealmUser;
}

interface RealmIdentification extends RealmObject {
  current: boolean;
  user: RealmUser;
}

export interface RealmObservationPojo {
  _created_at?: Date;
  _synced_at?: Date;
  captive_flag: boolean | null;
  comments: Array<RealmComment>;
  comments_viewed?: boolean;
  description: string | null;
  geoprivacy: string | null;
  identifications: Array<RealmIdentification>;
  identifications_viewed?: boolean;
  latitude: number | null;
  longitude: number | null;
  obscured?: boolean;
  observationPhotos: Array<RealmObservationPhotoPojo>;
  observationSounds: Array<RealmObservationSoundPojo>;
  observed_on?: string;
  observed_on_string: string | null;
  observed_time_zone?: string;
  owners_identification_from_vision: boolean | null;
  place_guess: string | null;
  positional_accuracy: number | null;
  species_guess: string | null;
  taxon_id: number | null;
  taxon?: RealmTaxon;
  taxon_geoprivacy?: "open" | "private" | "obscured" | null;
  time_observed_at?: string;
  timeObservedAt?: string;
  uuid: string;
}

export interface RealmObservation extends RealmObservationPojo {
  missingBasics: ( ) => boolean;
  needsSync: ( ) => boolean;
  observationPhotos: Array<RealmObservationPhoto>;
  observationSounds: Array<RealmObservationSound>;
  unviewed: ( ) => boolean;
  updateNeedsSync: ( ) => boolean;
  viewed: ( ) => boolean;
  wasSynced: ( ) => boolean;
}
