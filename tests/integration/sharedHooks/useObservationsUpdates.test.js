import { renderHook } from "@testing-library/react-native";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import useObservationsUpdates from "sharedHooks/useObservationsUpdates";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier],
      useQuery: ( ) => [],
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

jest.mock( "api/observations" );

const mockUser = factory( "LocalUser" );

let mockCurrentData = [];

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: ( ) => ( {
    data: mockCurrentData,
  } ),
} ) );

const commentUpdateFor = uuid => factory( "RemoteUpdate", {
  comment_id: 1,
  viewed: false,
  resource_uuid: uuid,
} );
const identificationUpdateFor = uuid => factory( "RemoteUpdate", {
  identification_id: 2,
  viewed: false,
  resource_uuid: uuid,
} );

const writeObs = attrs => {
  const realm = global.mockRealms[mockRealmIdentifier];
  safeRealmWrite( realm, ( ) => {
    realm.deleteAll( );
    realm.create( "Observation", factory( "LocalObservation", attrs ) );
  }, "write test observation, useObservationsUpdates test" );
};

const findObs = uuid => global.mockRealms[mockRealmIdentifier]
  .objectForPrimaryKey( "Observation", uuid );

describe( "useObservationsUpdates", ( ) => {
  beforeEach( ( ) => {
    mockCurrentData = [];
  } );

  it( "marks comments_viewed false when a matching unread comment arrives", ( ) => {
    const uuid = faker.string.uuid( );
    writeObs( { uuid, comments_viewed: true, identifications_viewed: true } );
    mockCurrentData = [commentUpdateFor( uuid )];

    renderHook( ( ) => useObservationsUpdates( mockUser ) );

    const observation = findObs( uuid );
    expect( observation.comments_viewed ).toBe( false );
    expect( observation.identifications_viewed ).toBe( true );
  } );

  it( "marks identifications_viewed false when a matching unread identification arrives", ( ) => {
    const uuid = faker.string.uuid( );
    writeObs( { uuid, comments_viewed: true, identifications_viewed: true } );
    mockCurrentData = [identificationUpdateFor( uuid )];

    renderHook( ( ) => useObservationsUpdates( mockUser ) );

    const observation = findObs( uuid );
    expect( observation.comments_viewed ).toBe( true );
    expect( observation.identifications_viewed ).toBe( false );
  } );

  it( "marks both flags false when matching comment and identification updates arrive", ( ) => {
    const uuid = faker.string.uuid( );
    writeObs( { uuid, comments_viewed: true, identifications_viewed: true } );
    mockCurrentData = [commentUpdateFor( uuid ), identificationUpdateFor( uuid )];

    renderHook( ( ) => useObservationsUpdates( mockUser ) );

    const observation = findObs( uuid );
    expect( observation.comments_viewed ).toBe( false );
    expect( observation.identifications_viewed ).toBe( false );
  } );

  it( "reconciles a locally-unviewed obs back to viewed when viewed elsewhere", ( ) => {
    const uuid = faker.string.uuid( );
    writeObs( { uuid, comments_viewed: false, identifications_viewed: false } );
    // Response contains an update for a different observation.
    mockCurrentData = [commentUpdateFor( faker.string.uuid( ) )];

    renderHook( ( ) => useObservationsUpdates( mockUser ) );

    const observation = findObs( uuid );
    expect( observation.comments_viewed ).toBe( true );
    expect( observation.identifications_viewed ).toBe( true );
  } );

  it( "skips the sweep when the response reaches per_page limit and may be truncated", ( ) => {
    const uuid = faker.string.uuid( );
    writeObs( { uuid, comments_viewed: false, identifications_viewed: false } );
    // Fill the response to PER_PAGE (100) with updates for unrelated observations,
    // simulating a user whose server-side unread queue may extend beyond the page.
    mockCurrentData = Array.from(
      { length: 100 },
      ( ) => commentUpdateFor( faker.string.uuid( ) ),
    );

    renderHook( ( ) => useObservationsUpdates( mockUser ) );

    const observation = findObs( uuid );
    expect( observation.comments_viewed ).toBe( false );
    expect( observation.identifications_viewed ).toBe( false );
  } );
} );
