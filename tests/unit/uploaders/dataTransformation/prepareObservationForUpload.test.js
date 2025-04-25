import Observation from "realmModels/Observation";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import {
  prepareObservationForUpload
} from "uploaders";

jest.mock( "realmModels/Observation", () => ( {
  mapObservationForUpload: jest.fn()
} ) );

const mockObservation = factory( "LocalObservation", {
  _synced_at: null,
  observed_on_string: "2024-05-02",
  latitude: 1.2345,
  longitude: 1.2345,
  taxon: {
    id: 123
  },
  observationPhotos: [
    factory( "LocalObservationPhoto", {
      photo: {
        url: `${faker.image.url( )}/100`,
        position: 0
      }
    } ),
    factory( "LocalObservationPhoto", {
      photo: {
        url: `${faker.image.url( )}/200`,
        position: 1
      }
    } )
  ]
} );

const mappedObservation = {
  captive_flag: null,
  description: null,
  geoprivacy: null,
  latitude: mockObservation.latitude,
  longitude: mockObservation.longitude,
  observed_on_string: mockObservation.observed_on_string,
  owners_identification_from_vision: null,
  place_guess: null,
  positional_accuracy: null,
  species_guess: null,
  taxon_id: mockObservation.taxon && mockObservation.taxon.id,
  uuid: mockObservation.uuid
};

describe( "prepareObservationForUpload", () => {
  afterEach( () => {
    jest.clearAllMocks();
  } );

  test( "should call Observation.mapObservationForUpload with the observation", () => {
    Observation.mapObservationForUpload.mockReturnValue( {
      captive_flag: null,
      description: null,
      geoprivacy: null,
      latitude: mockObservation.latitude,
      longitude: mockObservation.longitude,
      observed_on_string: mockObservation.observed_on_string,
      owners_identification_from_vision: null,
      place_guess: null,
      positional_accuracy: null,
      species_guess: null,
      taxon_id: mockObservation.taxon && mockObservation.taxon.id,
      uuid: mockObservation.uuid
    } );

    prepareObservationForUpload( mockObservation );

    expect( Observation.mapObservationForUpload ).toHaveBeenCalledWith( mockObservation );
  } );

  test( "should remove null values from the mapped observation", () => {
    Observation.mapObservationForUpload.mockReturnValue( mappedObservation );

    const result = prepareObservationForUpload( mockObservation );

    expect( result ).toEqual( {
      latitude: mockObservation.latitude,
      longitude: mockObservation.longitude,
      observed_on_string: mockObservation.observed_on_string,
      taxon_id: mockObservation.taxon && mockObservation.taxon.id,
      uuid: mockObservation.uuid
    } );
  } );

  test( "should handle empty field values correctly", () => {
    Observation.mapObservationForUpload.mockReturnValue( {
      ...mappedObservation,
      description: ""
    } );

    const result = prepareObservationForUpload( mockObservation );

    expect( result ).toEqual( {
      latitude: mockObservation.latitude,
      longitude: mockObservation.longitude,
      observed_on_string: mockObservation.observed_on_string,
      taxon_id: mockObservation.taxon && mockObservation.taxon.id,
      uuid: mockObservation.uuid,
      description: ""
    } );
  } );
} );
