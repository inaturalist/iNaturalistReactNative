import {
  act,
  screen,
  userEvent,
} from "@testing-library/react-native";
import useStore from "stores/useStore";
import factory from "tests/factory";
import {
  renderApp,
  renderAppWithObservations,
} from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

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

const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useSuggestions/useOnlineSuggestions", ( ) => jest.fn( () => ( {
  dataUpdatedAt: new Date( ),
  error: null,
  loadingOnlineSuggestions: false,
  onlineSuggestions: {
    results: [],
  },
} ) ) );

beforeEach( async () => {
  setStoreStateLayout( {
    isDefaultMode: false,
  } );
} );

describe( "MediaViewer navigation", ( ) => {
  const actor = userEvent.setup( );

  async function findAndPressByText( text ) {
    const pressable = await screen.findByLabelText( text );
    await actor.press( pressable );
    return pressable;
  }

  async function findAndPressByLabelText( labelText ) {
    const pressable = await screen.findByLabelText( labelText );
    await actor.press( pressable );
    return pressable;
  }

  beforeAll( async () => {
    jest.useFakeTimers( );
  } );

  beforeEach( async ( ) => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
  } );

  afterEach( ( ) => {
    signOut( );
  } );

  describe( "from ObsEdit", ( ) => {
    const observation = factory( "LocalObservation", {
      _synced_at: null,
      needsSync: jest.fn( ( ) => true ),
      wasSynced: jest.fn( ( ) => false ),
      observationPhotos: [
        factory( "LocalObservationPhoto" ),
        factory( "LocalObservationPhoto" ),
      ],
    } );
    const observations = [observation];
    useStore.setState( { observations } );

    beforeEach( ( ) => {
      expect( observation.wasSynced( ) ).toBeFalsy( );
      expect( observation.observationPhotos.length ).toBeGreaterThan( 0 );
    } );

    async function navigateToObsEdit( ) {
      await renderAppWithObservations( observations, __filename );
      const observationGridItem = await screen.findByTestId(
        `MyObservations.obsGridItem.${observation.uuid}`,
      );
      await actor.press( observationGridItem );
    }

    it( "should show the first photo when tapped", async ( ) => {
      await navigateToObsEdit( );
      const obsEditPhotos = await screen.findAllByTestId( "ObsEdit.photo" );
      expect( obsEditPhotos.length ).toEqual( observation.observationPhotos.length );
      await act( async ( ) => actor.press( obsEditPhotos[0] ) );
      expect(
        await screen.findByTestId( `CustomImageZoom.${observation.observationPhotos[0].photo.url}` ),
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      ).toBeOnTheScreen( );
    } );

    it( "should not show the first photo when second tapped", async ( ) => {
      await navigateToObsEdit( );
      const obsEditPhotos = await screen.findAllByTestId( "ObsEdit.photo" );
      expect( obsEditPhotos.length ).toEqual( observation.observationPhotos.length );
      await act( async ( ) => actor.press( obsEditPhotos[1] ) );
      expect(
        await screen.findByTestId( `CustomImageZoom.${observation.observationPhotos[1].photo.url}` ),
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      ).toBeOnTheScreen( );
      expect(
        screen.queryByTestId( `CustomImageZoom.${observation.observationPhotos[0].photo.url}` ),
      ).toBeFalsy( );
    } );

    it( "should show delete button", async ( ) => {
      await navigateToObsEdit( );
      const obsEditPhotos = await screen.findAllByTestId( "ObsEdit.photo" );
      expect( obsEditPhotos.length ).toEqual( observation.observationPhotos.length );
      await act( async ( ) => actor.press( obsEditPhotos[0] ) );
      const deleteButtons = await screen.findAllByLabelText( "Delete photo" );
      expect( deleteButtons.length ).toEqual( observation.observationPhotos.length );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( deleteButtons[0] ).toBeOnTheScreen( );
    } );
  } );

  describe( "from StandardCamera with advanced user layout", ( ) => {
    async function navigateToCamera( ) {
      await renderApp( );
      await findAndPressByText( "Add observations" );
      await findAndPressByLabelText( "Camera" );
    }

    beforeEach( ( ) => {
      setStoreStateLayout( {
        isAllAddObsOptionsMode: true,
      } );
    } );

    it( "should show a photo when tapped", async ( ) => {
      navigateToCamera( );
      await findAndPressByLabelText( "Take photo" );
      const photo = await findAndPressByLabelText( "View photo" );
      await actor.press( photo );

      expect( await screen.findByTestId( /CustomImageZoom/ ) ).toBeOnTheScreen();
    } );

    // Haven't figured these out b/c I would need the URL of newly-created
    // photos, which will probably involve altering the camera mock.
    // ~~~kueda20231207
    it.todo( "should show the first photo when tapped" );
    it.todo( "should not show the first photo when second tapped" );

    it( "should show delete button", async ( ) => {
      navigateToCamera( );
      await findAndPressByLabelText( "Take photo" );
      await findAndPressByLabelText( "View photo" );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( await screen.findByLabelText( "Delete photo" ) ).toBeOnTheScreen( );
    } );
  } );
} );
