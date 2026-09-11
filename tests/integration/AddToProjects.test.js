import { screen, userEvent, waitFor } from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import { mockInteractionManagerRunAfterInteractions } from "tests/helpers/addObsBottomSheet";
import faker from "tests/helpers/faker";
import { renderAppWithObservations } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

// We're explicitly using navigation here
jest.unmock( "@react-navigation/native" );

// // UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll }
  = setupUniqueRealm( mockRealmIdentifier );
jest.mock( "realmModels/index", () => mockRealmModelsIndex );
jest.mock( "providers/contexts", () => {
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

const actor = userEvent.setup();

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

async function selectProjectAndExpand( projectId ) {
  const projectRow = await waitFor( ( ) => {
    const row = screen.getByTestId( `AddToProjects.project.${projectId}` );
    expect( row ).toBeVisible( );
    return row;
  } );
  await actor.press( projectRow );
  await waitFor( ( ) => {
    expect( screen.getAllByLabelText( "Enter a response" ).length ).toBeGreaterThan( 0 );
  } );
}

async function fillRequiredTextField( value ) {
  const obsField = mockProject.project_observation_fields[0].observation_field;
  await screen.findByText( obsField.name );
  const textInput = screen.getAllByPlaceholderText( "Enter a response" ).find(
    node => typeof node.props.onChangeText === "function",
  );
  expect( textInput ).toBeTruthy( );
  jest.useRealTimers( );
  try {
    await actor.type( textInput, value );
  } finally {
    jest.useFakeTimers( );
  }
  await waitFor( ( ) => {
    const { currentObservation } = useStore.getState( );
    expect( currentObservation?.observationFieldValues ).toEqual(
      expect.arrayContaining( [
        expect.objectContaining( { obsFieldId: obsField.id, value } ),
      ] ),
    );
  } );
}

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

  it( "persists PO and OFV to Realm after chooser save and ObsEdit save", async () => {
    await navigateToAddToProjectsViaObsEdit( mockObservations );

    await selectProjectAndExpand( mockProject.id );
    const fieldValue = "shrubland";
    await fillRequiredTextField( fieldValue );
  } );
} );
