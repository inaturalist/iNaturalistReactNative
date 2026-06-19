import { PROJECT_OBSERVATION_FIELDS } from "api/fields";
import {
  createProjectObservation,
  deleteProjectObservation,
  updateProjectObservation,
} from "api/projectObservations";
import inatjs from "inaturalistjs";
import { makeResponse } from "tests/factory";

jest.mock( "inaturalistjs" );

const mockCreate = jest.mocked( inatjs.project_observations.create );
const mockUpdate = jest.mocked( inatjs.project_observations.update );
const mockDelete = jest.mocked( inatjs.project_observations.delete );

const PARAMS = {
  fields: PROJECT_OBSERVATION_FIELDS,
};

describe( "projectObservations", () => {
  const opts = { api_token: "test-token" };
  const params = {
    project_observation: {
      observation_id: "609a4361-9c75-4841-9181-295b6ba55b8c",
      project_id: 508,
    },
  };

  beforeEach( () => {
    jest.resetAllMocks();
    mockCreate.mockResolvedValue( makeResponse( { id: 1 } ) );
    mockUpdate.mockResolvedValue( makeResponse( { id: 1 } ) );
    mockDelete.mockResolvedValue( makeResponse( ) );
  } );

  describe( "createProjectObservation", () => {
    it( "passes nested params with fields to inatjs.project_observations.create", async () => {
      await createProjectObservation( params, opts );

      expect( mockCreate ).toHaveBeenCalledWith( { ...PARAMS, ...params }, opts );
    } );
  } );

  describe( "updateProjectObservation", () => {
    it( "passes id, nested params, and fields to inatjs.project_observations.update", async () => {
      await updateProjectObservation( { id: 99, ...params }, opts );

      expect( mockUpdate ).toHaveBeenCalledWith(
        { ...PARAMS, id: 99, ...params },
        opts,
      );
    } );
  } );

  describe( "deleteProjectObservation", () => {
    it( "passes id to inatjs.project_observations.delete", async () => {
      await deleteProjectObservation( 99, opts );

      expect( mockDelete ).toHaveBeenCalledWith( { id: 99 }, opts );
    } );
  } );
} );
