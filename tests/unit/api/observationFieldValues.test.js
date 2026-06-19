import { OBSERVATION_FIELD_VALUE_FIELDS } from "api/fields";
import {
  createObservationFieldValue,
  deleteObservationFieldValue,
  updateObservationFieldValue,
} from "api/observationFieldValues";
import inatjs from "inaturalistjs";
import { makeResponse } from "tests/factory";

jest.mock( "inaturalistjs" );

const mockCreate = jest.mocked( inatjs.observation_field_values.create );
const mockUpdate = jest.mocked( inatjs.observation_field_values.update );
const mockDelete = jest.mocked( inatjs.observation_field_values.delete );

const PARAMS = {
  fields: OBSERVATION_FIELD_VALUE_FIELDS,
};

describe( "observationFieldValues", () => {
  const opts = { api_token: "test-token" };
  const params = {
    observation_field_value: {
      observation_id: "609a4361-9c75-4841-9181-295b6ba55b8c",
      observation_field_id: 2369,
      value: 12,
    },
  };

  beforeEach( () => {
    jest.resetAllMocks();
    mockCreate.mockResolvedValue( makeResponse( { id: 1 } ) );
    mockUpdate.mockResolvedValue( makeResponse( { id: 1 } ) );
    mockDelete.mockResolvedValue( makeResponse( ) );
  } );

  describe( "createObservationFieldValue", () => {
    it( "passes nested params with fields to inatjs.observation_field_values.create", async () => {
      await createObservationFieldValue( params, opts );

      expect( mockCreate ).toHaveBeenCalledWith( { ...PARAMS, ...params }, opts );
    } );
  } );

  describe( "updateObservationFieldValue", () => {
    it( "passes id and params to inatjs.observation_field_values.update", async () => {
      await updateObservationFieldValue( { id: 88, ...params }, opts );

      expect( mockUpdate ).toHaveBeenCalledWith(
        { ...PARAMS, id: 88, ...params },
        opts,
      );
    } );
  } );

  describe( "deleteObservationFieldValue", () => {
    it( "passes id to inatjs.observation_field_values.delete", async () => {
      await deleteObservationFieldValue( 88, opts );

      expect( mockDelete ).toHaveBeenCalledWith( { id: 88 }, opts );
    } );
  } );
} );
