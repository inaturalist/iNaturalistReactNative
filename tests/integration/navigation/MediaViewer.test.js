import {
  screen,
  userEvent
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import os from "os";
import path from "path";
import Realm from "realm";
import realmConfig from "realmModels/index";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import {
  renderApp,
  renderAppWithObservations
} from "tests/helpers/render";
import { signIn, signOut } from "tests/helpers/user";

const initialStoreState = useStore.getState( );

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

// This is a bit crazy, but this ensures this test uses its own in-memory
// database and doesn't interfere with the single, default in-memory database
// used by other tests. In a perfect world, every parallel test worker would
// have its own database, or at least this wouldn't be so manual, but it took
// me long enough to figure this out. ~~~kueda 20231024
// REALM SETUP
const mockRealmConfig = {
  schema: realmConfig.schema,
  schemaVersion: realmConfig.schemaVersion,
  // No need to actually write to disk
  inMemory: true,
  // For an in memory db path is basically a unique identifier, *but* Realm
  // may still write some metadata to disk, so this needs to be a real, but
  // temporary, path. In theory this should prevent this test from
  // interacting with other tests
  path: path.join( os.tmpdir( ), `${path.basename( __filename )}.realm` )
};

// Mock the config so that all code that runs during this test talks to the same database
jest.mock( "realmModels/index", ( ) => ( {
  __esModule: true,
  default: mockRealmConfig
} ) );

jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[__filename]
    }
  };
} );

// Open a realm connection and stuff it in global
beforeAll( async ( ) => {
  global.mockRealms = global.mockRealms || {};
  global.mockRealms[__filename] = await Realm.open( mockRealmConfig );
  useStore.setState( initialStoreState, true );
} );

// Ensure the realm connection gets closed
afterAll( ( ) => {
  global.mockRealms[__filename]?.close( );
  jest.clearAllMocks( );
} );
// /REALM SETUP

const mockUser = factory( "LocalUser" );

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
    await initI18next();
    jest.useFakeTimers( );
  } );

  beforeEach( async ( ) => {
    await signIn( mockUser );
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
        factory( "LocalObservationPhoto" )
      ]
    } );
    const observations = [observation];
    useStore.setState( { observations } );

    beforeEach( ( ) => {
      expect( observation.wasSynced( ) ).toBeFalsy( );
      expect( observation.observationPhotos.length ).toBeGreaterThan( 0 );
    } );

    async function navigateToObsEdit( ) {
      await renderAppWithObservations( observations, __filename );
      const observationRow = await screen.findByTestId(
        `MyObservations.obsListItem.${observation.uuid}`
      );
      await actor.press( observationRow );
    }

    it( "should show the first photo when tapped", async ( ) => {
      await navigateToObsEdit( );
      const obsEditPhotos = await screen.findAllByTestId( "ObsEdit.photo" );
      expect( obsEditPhotos.length ).toEqual( observation.observationPhotos.length );
      await actor.press( obsEditPhotos[0] );
      expect(
        await screen.findByTestId( `CustomImageZoom.${observation.observationPhotos[0].photo.url}` )
      ).toBeVisible( );
    } );

    it( "should not show the first photo when second tapped", async ( ) => {
      await navigateToObsEdit( );
      const obsEditPhotos = await screen.findAllByTestId( "ObsEdit.photo" );
      expect( obsEditPhotos.length ).toEqual( observation.observationPhotos.length );
      await actor.press( obsEditPhotos[1] );
      expect(
        await screen.findByTestId( `CustomImageZoom.${observation.observationPhotos[1].photo.url}` )
      ).toBeVisible( );
      expect(
        screen.queryByTestId( `CustomImageZoom.${observation.observationPhotos[0].photo.url}` )
      ).toBeFalsy( );
    } );

    it( "should show delete button", async ( ) => {
      await navigateToObsEdit( );
      const obsEditPhotos = await screen.findAllByTestId( "ObsEdit.photo" );
      expect( obsEditPhotos.length ).toEqual( observation.observationPhotos.length );
      await actor.press( obsEditPhotos[0] );
      const deleteButtons = await screen.findAllByLabelText( "Delete photo" );
      expect( deleteButtons.length ).toEqual( observation.observationPhotos.length );
      expect( deleteButtons[0] ).toBeVisible( );
    } );
  } );

  describe( "from StandardCamera", ( ) => {
    async function navigateToCamera( ) {
      await renderApp( );
      await findAndPressByText( "Add observations" );
      await findAndPressByLabelText( "Camera" );
    }

    it( "should show a photo when tapped", async ( ) => {
      navigateToCamera( );
      await findAndPressByLabelText( "Take photo" );
      const photo = await findAndPressByLabelText( "View photo" );
      await actor.press( photo );

      expect( await screen.findByTestId( "CustomImageZoom" ) ).toBeTruthy( );
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
      expect( await screen.findByLabelText( "Delete photo" ) ).toBeVisible( );
    } );
  } );

  describe( "from ObsDetail", ( ) => {
    const observation = factory( "RemoteObservation", {
      observation_photos: [
        factory( "RemoteObservationPhoto" ),
        factory( "RemoteObservationPhoto" )
      ]
    } );
    const observations = [observation];
    useStore.setState( { observations } );

    async function navigateToObsDetail( ) {
      await renderAppWithObservations( observations, __filename );
      const observationRow = await screen.findByTestId(
        `MyObservations.obsListItem.${observation.uuid}`
      );
      await actor.press( observationRow );
      expect( await screen.findByTestId( `ObsDetails.${observation.uuid}` ) ).toBeVisible( );
    }

    it( "should show the first photo when tapped", async ( ) => {
      await navigateToObsDetail( );
      const photos = await screen.findAllByTestId( "PhotoScroll.photo" );
      expect( photos[0] ).toBeVisible( );
      await actor.press( photos[0] );
      expect(
        await screen.findByTestId(
          `CustomImageZoom.${observation.observation_photos[0].photo.url}`
        )
      ).toBeVisible( );
    } );

    // Not sure why this was working. Both photos might technically
    // be "visible" even if one isn't on screen
    it.todo( "should not show the first photo when second tapped" );
    // it( "should not show the first photo when second tapped", async ( ) => {
    //   await navigateToObsDetail( );
    //   const photos = await screen.findAllByTestId( "PhotoScroll.photo" );
    //   await actor.press( photos[1] );
    //   expect(
    //     await screen.findByTestId(
    //       `CustomImageZoom.${observation.observation_photos[1].photo.url}`
    //     )
    //   ).toBeVisible( );
    //   expect(
    //     screen.queryByTestId( `CustomImageZoom.${observation.observation_photos[0].photo.url}` )
    //   ).not.toBeVisible( );
    // } );

    it( "should not show delete button", async ( ) => {
      await navigateToObsDetail( );
      const photos = await screen.findAllByTestId( "PhotoScroll.photo" );
      expect( photos[0] ).toBeVisible( );
      await actor.press( photos[0] );
      expect(
        await screen.findByTestId(
          `CustomImageZoom.${observation.observation_photos[0].photo.url}`
        )
      ).toBeVisible( );
      expect( screen.queryByLabelText( "Delete photo" ) ).toBeFalsy( );
    } );
  } );

  describe( "from TaxonDetail", ( ) => {
    const taxonPhotos = [
      factory( "RemoteTaxonPhoto" ),
      factory( "RemoteTaxonPhoto" )
    ];
    const taxon = factory( "RemoteTaxon", {
      // inatjs attribute
      taxonPhotos
    } );
    const observation = factory( "RemoteObservation", { taxon } );
    const observations = [observation];
    useStore.setState( { observations } );

    beforeEach( ( ) => {
      inatjs.taxa.fetch.mockResolvedValue( makeResponse( [taxon] ) );
    } );

    afterEach( ( ) => {
      inatjs.taxa.fetch.mockReset( );
    } );

    async function navigateToTaxonDetail( ) {
      await renderAppWithObservations( observations, __filename );
      const observationRow = await screen.findByTestId(
        `MyObservations.obsListItem.${observation.uuid}`
      );
      await actor.press( observationRow );
      expect( await screen.findByTestId( `ObsDetails.${observation.uuid}` ) ).toBeVisible( );
      const displayedTaxon = await screen.findByText( taxon.name );
      await actor.press( displayedTaxon );
      expect( await screen.findByTestId( `TaxonDetails.${taxon.id}` ) ).toBeVisible( );
    }

    it( "should show the first photo when tapped", async ( ) => {
      await navigateToTaxonDetail( );
      const photo = await screen.findByTestId( "TaxonDetails.photo" );
      expect( photo ).toBeVisible( );
      await actor.press( photo );
      expect(
        await screen.findByTestId(
          `CustomImageZoom.${taxon.taxonPhotos[0].photo.url}`
        )
      ).toBeVisible( );
    } );

    it( "should not show delete button", async ( ) => {
      await navigateToTaxonDetail( );
      const photo = await screen.findByTestId( "TaxonDetails.photo" );
      expect( photo ).toBeVisible( );
      await actor.press( photo );
      expect(
        await screen.findByTestId(
          `CustomImageZoom.${taxon.taxonPhotos[0].photo.url}`
        )
      ).toBeVisible( );
      expect( screen.queryByLabelText( "Delete photo" ) ).toBeFalsy( );
    } );
  } );
} );
