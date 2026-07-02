export interface LocationPickerObservation {
  latitude?: number;
  longitude?: number;

  privateLatitude?: number;
  privateLongitude?: number;

  positional_accuracy?: number;
  positionalAccuracy?: number;
}

export interface LocationPickerPlace {
  id: string;
  display_name: string;
  point_geojson: {
    coordinates: number[];
  };
  bounding_box_geojson: {
    // bbox is a 5-point clockwise rectangle starting from SW (5th === 1st),
    // so the 1st and 3rd points give us the SW and NE corners.
    coordinates: [
      [
        // SW
        [number, number],
        // (discard)
        [number, number],
        // NE
        [number, number],
        // ... don't need the rest
      ]
    ];
  };
}
