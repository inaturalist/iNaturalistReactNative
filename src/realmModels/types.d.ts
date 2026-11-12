import type User from "realmModels/User";

import type { Geoprivacy } from "./geoprivacy";

// https://github.com/inaturalist/iNaturalistAPI/blob/08e3aade068c50e02d0caf7a59c69ea87b70bc6e/lib/views/swagger_v1.yml.ejs#L2319-L2333
export type License =
  | "cc-by"
  | "cc-by-nc"
  | "cc-by-nd"
  | "cc-by-sa"
  | "cc-by-nc-nd"
  | "cc-by-nc-sa"
  | "cc0"

interface RealmObject {
  isValid: ( ) => boolean;
}

export interface RealmPhoto extends RealmObject {
  _created_at?: Date;
  _synced_at?: Date;
  _updated_at?: Date;
  id: number;
  attribution?: string;
  licenseCode?: License;
  url?: string;
  localFilePath?: string;
}

export interface RealmSound extends RealmObject {
  _created_at?: Date;
  _synced_at?: Date;
  _updated_at?: Date;
  id: number;
  attribution?: string;
  licenseCode?: License;
  file_url: string;
}

export interface RealmObservationPhotoPojo extends RealmObject {
  uuid: string;
  id?: number;
  originalPhotoUri?: string;
  photo: RealmPhoto;
  position?: number;
}

export interface RealmObservationPhoto extends RealmObservationPhotoPojo {
  needsSync: ( ) => boolean;
  wasSynced: ( ) => boolean;
}

export interface RealmObservationSoundPojo extends RealmObject {
  uuid: string;
  id?: number;
  sound: RealmSound;
}

export interface RealmObservationSound extends RealmObservationSoundPojo {
  needsSync: ( ) => boolean;
  wasSynced: ( ) => boolean;
}

export interface RealmObservationField extends RealmObject {
  allowedValues: string[];
  datatype?: string;
  description?: string;
  id: number;
  name?: string;
}

export interface RealmProjectObservationField extends RealmObject {
  id: number;
  obsField?: RealmObservationField;
  position: number;
  required: boolean;
}

export interface RealmProjectObservationRule extends RealmObject {
  id: number;
  operand_id?: number;
  operator: string;
  place_display_name?: string;
}

export interface RealmProject extends RealmObject {
  icon?: string;
  id: number;
  projectObservationFields: RealmProjectObservationField[];
  project_observation_rules: RealmProjectObservationRule[];
  project_type?: string;
  title?: string;
}

export interface RealmProjectObservationPojo extends RealmObject {
  _created_at?: Date;
  _synced_at?: Date;
  _updated_at?: Date;
  _pending_deletion?: boolean;
  // TODO: we are conflating types of different purposes: this key is Zustand relevant only,
  // not added to realm
  _pendingRemoval?: boolean;
  uuid: string;
  id?: number | null;
  projectId: number;
}

export interface RealmProjectObservation extends RealmProjectObservationPojo {
  needsSync: ( ) => boolean;
  wasSynced: ( ) => boolean;
}

export interface RealmObservationFieldValuePojo extends RealmObject {
  _created_at?: Date;
  _synced_at?: Date;
  _updated_at?: Date;
  _pending_deletion?: boolean;
  // TODO: we are conflating types of different purposes: this key is Zustand relevant only,
  // not added to realm
  _pendingRemoval?: boolean;
  uuid: string;
  id?: number;
  obsFieldId: number;
  value?: string;
}

export interface RealmObservationFieldValue extends RealmObservationFieldValuePojo {
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

interface RealmComment extends RealmObject {
  user: User;
}

interface RealmIdentification extends RealmObject {
  current: boolean;
  user: User;
}

export interface RealmObservationPojo {
  _created_at?: Date;
  _synced_at?: Date;
  captive?: boolean | null;
  captive_flag: boolean | null;
  comments: RealmComment[];
  comments_viewed?: boolean;
  description: string | null;
  geoprivacy: Geoprivacy;
  identifications: RealmIdentification[];
  identifications_viewed?: boolean;
  latitude: number | null;
  license_code: License | null;
  longitude: number | null;
  obscured?: boolean;
  observationFieldValues: RealmObservationFieldValuePojo[];
  observationPhotos: RealmObservationPhotoPojo[];
  observationSounds: RealmObservationSoundPojo[];
  observed_on?: string;
  observed_on_string: string | null;
  observed_time_zone?: string;
  owners_identification_from_vision: boolean | null;
  place_guess: string | null;
  privateLatitude: number | null;
  privateLongitude: number | null;
  projectObservations: RealmProjectObservationPojo[];
  positional_accuracy: number | null;
  species_guess: string | null;
  taxon_id: number | null;
  taxon?: RealmTaxon;
  taxon_geoprivacy?: Geoprivacy;
  time_observed_at?: string;
  timeObservedAt?: string;
  uploadErrorMessage?: string | null;
  user: User;
  uuid: string;
}

export interface RealmObservation extends RealmObservationPojo {
  missingCoords: ( ) => boolean;
  missingBasics: ( ) => boolean;
  needsSync: ( ) => boolean;
  observationFieldValues: RealmObservationFieldValue[];
  observationPhotos: RealmObservationPhoto[];
  observationSounds: RealmObservationSound[];
  projectObservations: RealmProjectObservation[];
  unviewed: ( ) => boolean;
  updateNeedsSync: ( ) => boolean;
  viewed: ( ) => boolean;
  wasSynced: ( ) => boolean;
}
