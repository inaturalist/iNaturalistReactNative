export interface ObservationPhotos {
  uuid: string
}

export interface RealmObservation {
  _created_at: Date | null,
  _synced_at: Date | null,
  captive_flag: boolean | null,
  description: string | null,
  geoprivacy: string | null,
  latitude: number | null,
  longitude: number | null,
  observed_on_string: string | null,
  observationPhotos: ObservationPhotos[],
  observationSounds: Array<Object>,
  owners_identification_from_vision: boolean | null,
  positional_accuracy: number | null,
  place_guess: string | null,
  positional_accuracy: number | null,
  species_guess: string | null,
  taxon_id: number | null,
  uuid: string
}
