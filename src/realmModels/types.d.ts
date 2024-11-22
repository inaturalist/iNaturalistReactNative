export interface RealmObservationPhoto {
  originalPhotoUri?: string;
}

export interface RealmObservation {
  _created_at?: Date;
  _synced_at?: Date;
  captive_flag: boolean | null;
  description: string | null;
  geoprivacy: string | null;
  latitude: number | null;
  longitude: number | null;
  observationPhotos: Array<RealmObservationPhoto>;
  observationSounds: Array<Object>;
  observed_on_string: string | null;
  owners_identification_from_vision: boolean | null;
  place_guess: string | null;
  positional_accuracy: number | null;
  species_guess: string | null;
  taxon_id: number | null;
  uuid: string;
}

export interface RealmPhoto {
  _created_at?: Date;
  _synced_at?: Date;
  _updated_at?: Date;
  id: number;
  attribution?: string;
  licenseCode?: string; // TODO type this with actual codes
  url?: string;
  localFilePath?: string;
}

export interface RealmTaxon {
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
