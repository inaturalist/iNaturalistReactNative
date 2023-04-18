import { renderHook } from "@testing-library/react-native";
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

const mockObservation = factory( "LocalObservation" );
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
  } );

  afterEach( () => {
    // Clear mocks after each test to handle different cases of realm.write being called or not
    jest.clearAllMocks();
  } );

  it( "should return an object", ( ) => {
    const { result } = renderHook( ( ) => useObservationsUpdates( ) );
    expect( result.current ).toEqual( { isLoading: false } );
  } );

  it( "should call disabled useAuthenticatedQuery without current user param", ( ) => {
    renderHook( ( ) => useObservationsUpdates( undefined ) );
    expect( useAuthenticatedQuery ).toHaveBeenCalledWith(
      ["fetchObservationUpdates"],
      expect.any( Function ),
      { enabled: false }
    );
  } );

  it( "should call enabled useAuthenticatedQuery with current user param", ( ) => {
    renderHook( ( ) => useObservationsUpdates( mockUser ) );
    expect( useAuthenticatedQuery ).toHaveBeenCalledWith(
      ["fetchObservationUpdates"],
      expect.any( Function ),
      { enabled: true }
    );
  } );

  describe.each( [
    ["comment", mockCommentUpdate],
    ["identification", mockIdentificationUpdate]
  ] )( "when the update is a %s", ( a, update ) => {
    beforeEach( ( ) => {
      useAuthenticatedQuery.mockReturnValue( { data: [update], isLoading: false } );
    } );

    describe.each( [
      ["viewed comments and viewed identifications", true, true],
      ["viewed comments and not viewed identifications", true, false],
      ["not viewed comments and viewed identifications", false, true],
      ["not viewed comments and not viewed identifications", false, false]
    ] )( "when the local observation has %s", ( a1, viewedComments, viewedIdentifications ) => {
      beforeEach( ( ) => {
        mockRealm.objectForPrimaryKey.mockReturnValue( {
          ...mockObservation,
          viewed_comments: viewedComments,
          viewed_identifications: viewedIdentifications
        } );
      } );

      // Testing if realm.write is correctly called or not,
      // this is not testing the actual change in the local observation
      // Depending on whether the update is a comment or an identification
      // and whether the local observation has viewed comments or identifications
      // the realm.write function should be called or not
      const shouldCallRealmWrite = ( ( viewedComments && a === "comment" )
          || ( viewedIdentifications && a === "identification" ) );
      it( "should call realm.write", ( ) => {
        renderHook( ( ) => useObservationsUpdates( mockUser ) );
        if ( shouldCallRealmWrite ) {
          expect( mockRealm.write ).toHaveBeenCalled();
        }
      } );
      it( "should not call realm.write ", ( ) => {
        renderHook( ( ) => useObservationsUpdates( mockUser ) );
        if ( !shouldCallRealmWrite ) {
          expect( mockRealm.write ).not.toHaveBeenCalled();
        }
      } );
    } );
  } );
} );
