import { screen, userEvent, waitFor } from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import {
  mockInteractionManagerRunAfterInteractions,
} from "tests/helpers/addObsBottomSheet";
import faker from "tests/helpers/faker";
import { renderAppWithObservations } from "tests/helpers/render";
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

const actor = userEvent.setup( );

const mockUser = factory( "LocalUser", {
  login: faker.internet.username(),
  iconUrl: faker.image.url(),
  locale: "en",
} );

const observation = factory( "LocalObservation", {
  _created_at: faker.date.past(),
  taxon: factory( "LocalTaxon", {
    name: faker.person.firstName(),
  } ),
} );

const mockObservations = [observation];

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

describe( "AddToProjects from ObsEdit", ( ) => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

  beforeEach( async () => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
  } );

  afterEach( () => {
    signOut( { realm: global.mockRealms[__filename] } );
  } );

  async function navigateToAddToProjectsViaObsEdit( observations ) {
    // Nav to ObsEdit
    await renderAppWithObservations( observations, __filename );
    const observationGridItem = await screen.findByTestId(
      `MyObservations.obsGridItem.${observations[0].uuid}`,
    );
    await actor.press( observationGridItem );
    // Nav to Add To Projects
    const addToProjectsRow = await screen.findByLabelText(
      /Add to Projects|Added to \d+ Project/,
    );
    await actor.press( addToProjectsRow );
    await screen.findByTestId( "add-to-projects" );
    // Assert on Add To Projects screen
    expect( screen.getByTestId( "add-to-projects" ) ).toBeVisible();
    expect( screen.getByText( "ADD TO PROJECTS" ) ).toBeVisible();
  }

  it( "should show the chooser", async () => {
    await navigateToAddToProjectsViaObsEdit( mockObservations );
    // Assert on chooser
    expect( screen.getByTestId( "AddToProjects.list" ) ).toBeVisible( );
    expect( screen.getByTestId( `AddToProjects.project.${mockProject.id}` ) ).toBeVisible( );
  } );

  it( "should stay on the chooser when SAVE is blocked by missing required fields", async ( ) => {
    // Default for project factory is to create with one required POF
    await navigateToAddToProjectsViaObsEdit( mockObservations );
    await actor.press( screen.getByTestId( `AddToProjects.project.${mockProject.id}` ) );
    const saveButton = screen.getByTestId( "AddToProjects.saveButton" );
    expect( saveButton ).not.toBeDisabled( );
    await actor.press( saveButton );
    // Assert we are still on Add To Projects
    expect( await screen.findByTestId( "MissingInfoSheet" ) ).toBeVisible( );
    // Assert on Add To Projects screen
    expect( screen.getByTestId( "add-to-projects" ) ).toBeVisible();
    expect( screen.getByText( "ADD TO PROJECTS" ) ).toBeVisible();
    expect( screen.queryByText( /Edit Observation/ ) ).toBeNull( );
  } );

  it( "should return to ObsEdit when the header back button is pressed", async () => {
    // Default for project factory is to create with one required POF
    await navigateToAddToProjectsViaObsEdit( mockObservations );
    const backButton = await screen.findByTestId( "header-back-button" );
    await actor.press( backButton );
    // Assert on ObsEdit
    await waitFor( ( ) => {
      expect( screen.getByText( /Edit Observation/ ) ).toBeVisible( );
    } );
    expect( screen.queryByText( "ADD TO PROJECTS" ) ).toBeNull( );
  } );
} );
