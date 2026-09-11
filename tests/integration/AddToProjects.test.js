import inatjs from "inaturalistjs";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import {
  mockInteractionManagerRunAfterInteractions,
} from "tests/helpers/addObsBottomSheet";
import faker from "tests/helpers/faker";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

// // UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  const { makeRealmHooks } = jest.requireActual( "tests/helpers/uniqueRealm" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      ...makeRealmHooks( __filename ),
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// // /UNIQUE REALM SETUP

const mockUser = factory( "LocalUser", {
  login: faker.internet.username(),
  iconUrl: faker.image.url(),
  locale: "en",
} );

const mockProject = factory( "RemoteProject", {
  title: faker.lorem.sentence(),
  icon: faker.image.url(),
  header_image_url: faker.image.url(),
  description: faker.lorem.paragraph(),
  project_type: "",
  user_ids: [faker.number.int()],
} );

beforeAll( async () => {
  jest.useFakeTimers();
  mockInteractionManagerRunAfterInteractions();
  inatjs.users.projects.mockResolvedValue( makeResponse( [mockProject] ) );
} );

beforeEach( () => {
  setStoreStateLayout( {
    isDefaultMode: false,
  } );
  useStore.setState( {
    featureFlagConfig: {
      [FeatureFlag.TraditionalProjectsEnabled]: true,
    },
  } );
} );

describe( "AddToProjects", ( ) => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

  beforeEach( async () => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
  } );

  afterEach( () => {
    signOut( { realm: global.mockRealms[__filename] } );
  } );

  it( "should persist PO and OFV on save", async ( ) => {
  } );
} );
