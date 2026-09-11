import {
  screen,
  userEvent,
} from "@testing-library/react-native";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithObservations } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

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

beforeEach( () => {
  setStoreStateLayout( {
    isDefaultMode: false,
  } );
} );

describe( "AddToProjects from ObsEdit", ( ) => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

  const observation = factory( "LocalObservation", {
    _created_at: faker.date.past(),
    taxon: factory( "LocalTaxon", {
      name: faker.person.firstName(),
    } ),
  } );

  const mockObservations = [observation];

  async function navigateToAddToProjectsViaObsEdit( observations ) {
    await renderAppWithObservations( observations, __filename );
    const observationGridItem = await screen.findByTestId(
      `MyObservations.obsGridItem.${observations[0].uuid}`,
    );
    await actor.press( observationGridItem );
    const addToProjectsRow = await screen.findByLabelText(
      /Add to Projects|Added to \d+ Project/,
    );
    await actor.press( addToProjectsRow );
    await screen.findByTestId( "add-to-projects" );
  }

  it( "should show the chooser", async () => {
    await navigateToAddToProjectsViaObsEdit( mockObservations );
  } );
} );
