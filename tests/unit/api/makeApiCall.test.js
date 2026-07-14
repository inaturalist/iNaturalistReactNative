import handleError from "api/error";
import {
  makeApiCall,
  makeApiCallById,
  makeApiCallWithId,
} from "api/makeApiCall";
import { makeResponse } from "tests/factory";

jest.mock( "api/error", () => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

const opts = { api_token: "test-token" };

describe( "makeApiCall", () => {
  beforeEach( () => {
    jest.resetAllMocks();
  } );

  it( "calls the endpoint with params and opts", async () => {
    const endpoint = jest.fn().mockResolvedValue( makeResponse() );
    const apiCall = makeApiCall( endpoint, { functionName: "testCall" } );

    await apiCall( { q: "frog" }, opts );

    expect( endpoint ).toHaveBeenCalledWith( { q: "frog" }, opts );
  } );

  it( "defaults params and opts to empty objects", async () => {
    const endpoint = jest.fn().mockResolvedValue( makeResponse() );
    const apiCall = makeApiCall( endpoint, { functionName: "testCall" } );

    await apiCall();

    expect( endpoint ).toHaveBeenCalledWith( {}, {} );
  } );

  it( "merges defaultParams under caller params and overrideParams over them", async () => {
    const endpoint = jest.fn().mockResolvedValue( makeResponse() );
    const apiCall = makeApiCall( endpoint, {
      functionName: "testCall",
      defaultParams: { fields: "all", page: 1 },
      overrideParams: { per_page: 0 },
    } );

    await apiCall( { page: 2, per_page: 50 }, opts );

    expect( endpoint ).toHaveBeenCalledWith(
      { fields: "all", page: 2, per_page: 0 },
      opts,
    );
  } );

  it( "returns the full response by default", async () => {
    const response = makeResponse( [{ id: 1 }] );
    const endpoint = jest.fn().mockResolvedValue( response );
    const apiCall = makeApiCall( endpoint, { functionName: "testCall" } );

    expect( await apiCall() ).toBe( response );
  } );

  it( "extracts results", async () => {
    const endpoint = jest.fn().mockResolvedValue( makeResponse( [{ id: 1 }, { id: 2 }] ) );
    const apiCall = makeApiCall( endpoint, {
      functionName: "testCall",
      extract: "results",
    } );

    expect( await apiCall() ).toEqual( [{ id: 1 }, { id: 2 }] );
  } );

  it( "extracts the first result", async () => {
    const endpoint = jest.fn().mockResolvedValue( makeResponse( [{ id: 1 }, { id: 2 }] ) );
    const apiCall = makeApiCall( endpoint, {
      functionName: "testCall",
      extract: "firstResult",
    } );

    expect( await apiCall() ).toEqual( { id: 1 } );
  } );

  it( "extracts null when there is no first result", async () => {
    const endpoint = jest.fn().mockResolvedValue( makeResponse() );
    const apiCall = makeApiCall( endpoint, {
      functionName: "testCall",
      extract: "firstResult",
    } );

    expect( await apiCall() ).toBeNull();
  } );

  it( "extracts total_results", async () => {
    const endpoint = jest.fn().mockResolvedValue( makeResponse( [{ id: 1 }] ) );
    const apiCall = makeApiCall( endpoint, {
      functionName: "testCall",
      extract: "totalResults",
    } );

    expect( await apiCall() ).toEqual( 1 );
  } );

  it( "extracts with a custom function", async () => {
    const endpoint = jest.fn().mockResolvedValue( makeResponse( [{ id: 1 }] ) );
    const apiCall = makeApiCall( endpoint, {
      functionName: "testCall",
      extract: response => response.results.map( r => r.id ),
    } );

    expect( await apiCall() ).toEqual( [1] );
  } );

  it( "handles errors with functionName and opts in context", async () => {
    const error = new Error( "API broke" );
    const endpoint = jest.fn().mockRejectedValue( error );
    const apiCall = makeApiCall( endpoint, { functionName: "testCall" } );

    await apiCall( {}, opts );

    expect( handleError ).toHaveBeenCalledWith( error, {
      context: { functionName: "testCall", opts },
    } );
  } );

  it( "passes throw: true to handleError when configured with throwOnError", async () => {
    const error = new Error( "API broke" );
    const endpoint = jest.fn().mockRejectedValue( error );
    const apiCall = makeApiCall( endpoint, {
      functionName: "testCall",
      throwOnError: true,
    } );

    await apiCall( {}, opts );

    expect( handleError ).toHaveBeenCalledWith( error, {
      context: { functionName: "testCall", opts },
      throw: true,
    } );
  } );
} );

describe( "makeApiCallWithId", () => {
  beforeEach( () => {
    jest.resetAllMocks();
  } );

  it( "calls the endpoint with a positional id, merged params, and opts", async () => {
    const endpoint = jest.fn().mockResolvedValue( makeResponse( [{ id: 99 }] ) );
    const apiCall = makeApiCallWithId( endpoint, {
      functionName: "testFetch",
      defaultParams: { fields: "all" },
      extract: "firstResult",
    } );

    expect( await apiCall( 99, { locale: "en" }, opts ) ).toEqual( { id: 99 } );
    expect( endpoint ).toHaveBeenCalledWith( 99, { fields: "all", locale: "en" }, opts );
  } );

  it( "handles errors with the id in context", async () => {
    const error = new Error( "API broke" );
    const endpoint = jest.fn().mockRejectedValue( error );
    const apiCall = makeApiCallWithId( endpoint, { functionName: "testFetch" } );

    await apiCall( 99, {}, opts );

    expect( handleError ).toHaveBeenCalledWith( error, {
      context: { functionName: "testFetch", id: 99, opts },
    } );
  } );
} );

describe( "makeApiCallById", () => {
  beforeEach( () => {
    jest.resetAllMocks();
  } );

  it( "wraps the id in a params object", async () => {
    const endpoint = jest.fn().mockResolvedValue( makeResponse() );
    const apiCall = makeApiCallById( endpoint, {
      functionName: "testDelete",
      extract: "results",
    } );

    await apiCall( 99, opts );

    expect( endpoint ).toHaveBeenCalledWith( { id: 99 }, opts );
  } );

  it( "handles errors with the id in context", async () => {
    const error = new Error( "API broke" );
    const endpoint = jest.fn().mockRejectedValue( error );
    const apiCall = makeApiCallById( endpoint, { functionName: "testDelete" } );

    await apiCall( 99, opts );

    expect( handleError ).toHaveBeenCalledWith( error, {
      context: { functionName: "testDelete", id: 99, opts },
    } );
  } );
} );
