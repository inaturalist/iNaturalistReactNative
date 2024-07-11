export interface RealmObservation {
  captive_flag: boolean | null,
  description: string | null,
  geoprivacy: string | null,
  latitude: number | null,
  longitude: number | null,
  observed_on_string: string | null,
  observationPhotos: Array<Object>,
  observationSounds: Array<Object>,
  owners_identification_from_vision: boolean | null,
  place_guess: string | null,
  positional_accuracy: number | null,
  species_guess: string | null,
  taxon_id: number | null,
  uuid: string
}
