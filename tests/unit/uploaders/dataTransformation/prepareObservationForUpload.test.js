import Observation from "realmModels/Observation";
import {
  prepareObservationForUpload
} from "uploaders";

jest.mock( "realmModels/Observation", () => ( {
  mapObservationForUpload: jest.fn()
} ) );

describe( "prepareObservationForUpload", () => {
  afterEach( () => {
    jest.clearAllMocks();
  } );

  test( "should call Observation.mapObservationForUpload with the observation", () => {
    const mockObs = {
      uuid: "obs-123",
      taxon_id: 456,
      description: "Test observation"
    };

    Observation.mapObservationForUpload.mockReturnValue( {
      uuid: "obs-123",
      taxon_id: 456,
      description: "Test observation",
      created_at: null
    } );

    prepareObservationForUpload( mockObs );

    expect( Observation.mapObservationForUpload ).toHaveBeenCalledWith( mockObs );
  } );

  test( "should remove null values from the mapped observation", () => {
    const mockObs = {
      uuid: "obs-123",
      taxon_id: 456,
      description: "Test observation"
    };

    Observation.mapObservationForUpload.mockReturnValue( {
      uuid: "obs-123",
      taxon_id: 456,
      description: "Test observation",
      created_at: null,
      updated_at: null,
      species_guess: null
    } );

    const result = prepareObservationForUpload( mockObs );

    expect( result ).toEqual( {
      uuid: "obs-123",
      taxon_id: 456,
      description: "Test observation"
    } );
  } );

  test( "should handle empty field values correctly", () => {
    const mockObs = {
      uuid: "obs-123",
      taxon_id: 456,
      description: ""
    };

    Observation.mapObservationForUpload.mockReturnValue( {
      uuid: "obs-123",
      taxon_id: 456,
      description: "",
      created_at: null,
      location: null
    } );

    const result = prepareObservationForUpload( mockObs );

    expect( result ).toEqual( {
      uuid: "obs-123",
      taxon_id: 456,
      description: ""
    } );
  } );

  test( "should handle complex nested objects", () => {
    const mockObs = {
      uuid: "obs-123",
      taxon_id: 456,
      description: "Test observation"
    };

    Observation.mapObservationForUpload.mockReturnValue( {
      uuid: "obs-123",
      taxon_id: 456,
      description: "Test observation",
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: null,
        private_latitude: null,
        private_longitude: null
      },
      created_at: null
    } );

    const result = prepareObservationForUpload( mockObs );

    expect( result ).toEqual( {
      uuid: "obs-123",
      taxon_id: 456,
      description: "Test observation",
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: null,
        private_latitude: null,
        private_longitude: null
      }
    } );
  } );
} );
