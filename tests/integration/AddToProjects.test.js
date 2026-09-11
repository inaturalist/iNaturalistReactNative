import inatjs from "inaturalistjs";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import {
  mockInteractionManagerRunAfterInteractions,
} from "tests/helpers/addObsBottomSheet";
import faker from "tests/helpers/faker";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import { signIn, signOut } from "tests/helpers/user";

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
