import { renderHook } from "@testing-library/react-native";
import { fetchObservationUpdates } from "api/observations";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useObservationsUpdates from "sharedHooks/useObservationsUpdates";

import factory from "../../factory";

jest.mock( "sharedHooks/useAuthenticatedQuery" );
jest.mock( "api/observations" );

const mockUser = factory( "LocalUser" );

const mockCommentUpdate = factory( "RemoteUpdate", {
  comment_id: 1
} );
const mockIdentificationUpdate = factory( "RemoteUpdate", {
  identification_id: 2
} );
const mockData = [mockCommentUpdate, mockIdentificationUpdate];

const mockObservation = factory( "LocalObservation", {
  viewed_comments: false,
  viewed_identifications: false
} );
const mockObservation2 = factory( "LocalObservation", {
  viewed_comments: true,
  viewed_identifications: true
} );
const mockRealm = {
  objectForPrimaryKey: jest.fn( ).mockReturnValue( mockObservation ),
  write: jest.fn( )
};
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => mockRealm
    }
  };
} );

describe( "useObservationsUpdates", ( ) => {
  beforeEach( ( ) => {
    useAuthenticatedQuery.mockReturnValue( { data: mockData, isLoading: false } );
    fetchObservationUpdates.mockReturnValue( { } );
  } );

  it( "should return an object", ( ) => {
    const { result } = renderHook( ( ) => useObservationsUpdates( ) );
    expect( result.current ).toEqual( { isLoading: false } );
  } );

  it( "should call useAuthenticatedQuery not enabled without param given", ( ) => {
    renderHook( ( ) => useObservationsUpdates( undefined ) );
    expect( useAuthenticatedQuery ).toHaveBeenCalledWith(
      ["fetchObservationUpdates"],
      expect.any( Function ),
      { enabled: false }
    );
  } );

  it( "should call useAuthenticatedQuery enabled with param given", ( ) => {
    renderHook( ( ) => useObservationsUpdates( mockUser ) );
    expect( useAuthenticatedQuery ).toHaveBeenCalledWith(
      ["fetchObservationUpdates"],
      expect.any( Function ),
      { enabled: true }
    );
  } );

  describe( "when the local observation is not viewed", ( ) => {
    it( "should not call realm.write", () => {
      renderHook( () => useObservationsUpdates( mockUser ) );
      expect( mockRealm.write ).not.toHaveBeenCalled();
    } );
  } );

  describe( "when the local observation is viewed", ( ) => {
    beforeEach( ( ) => {
      mockRealm.objectForPrimaryKey.mockReturnValue( mockObservation2 );
    } );

    it( "should call realm.write", ( ) => {
      renderHook( ( ) => useObservationsUpdates( mockUser ) );
      expect( mockRealm.write ).toHaveBeenCalled();
    } );

    afterEach( ( ) => {
      mockRealm.objectForPrimaryKey.mockReturnValue( mockObservation );
    } );
  } );
} );
