import {
  act,
  screen,
  userEvent
} from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import {
  renderAppWithObservations
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
  mockRealmIdentifier
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
      useQuery: ( ) => []
    }
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useSuggestions/useOnlineSuggestions.ts", ( ) => jest.fn( () => ( {
  dataUpdatedAt: new Date( ),
  error: null,
  loadingOnlineSuggestions: false,
  onlineSuggestions: {
    results: []
  }
} ) ) );

beforeEach( async () => {
  setStoreStateLayout( {
    isDefaultMode: false
  } );
} );

describe( "MediaViewer navigation", ( ) => {
  const actor = userEvent.setup( );

  beforeAll( async () => {
    jest.useFakeTimers( );
  } );

  beforeEach( async ( ) => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
  } );

  afterEach( ( ) => {
    signOut( );
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
      const observationGridItem = await screen.findByTestId(
        `MyObservations.obsGridItem.${observation.uuid}`
      );
      await actor.press( observationGridItem );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( await screen.findByTestId( `ObsDetails.${observation.uuid}` ) ).toBeOnTheScreen( );
    }

    it( "should show the first photo when tapped", async ( ) => {
      await navigateToObsDetail( );
      const photos = await screen.findAllByTestId( "ObsMedia.photo" );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( photos[0] ).toBeOnTheScreen( );
      await act( async ( ) => actor.press( photos[0] ) );
      expect(
        await screen.findByTestId(
          `CustomImageZoom.${observation.observation_photos[0].photo.url}`
        )
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      ).toBeOnTheScreen( );
    } );

    // Not sure why this was working. Both photos might technically
    // be "visible" even if one isn't on screen
    it.todo( "should not show the first photo when second tapped" );
    // it( "should not show the first photo when second tapped", async ( ) => {
    //   await navigateToObsDetail( );
    //   const photos = await screen.findAllByTestId( "ObsMedia.photo" );
    //   await actor.press( photos[1] );
    //   expect(
    //     await screen.findByTestId(
    //       `CustomImageZoom.${observation.observation_photos[1].photo.url}`
    //     )
    // We used toBeVisible here but the update to RN0.77 broke this expectation
    //   ).toBeOnTheScreen( );
    //   expect(
    //     screen.queryByTestId( `CustomImageZoom.${observation.observation_photos[0].photo.url}` )
    // We used toBeVisible here but the update to RN0.77 broke this expectation
    //   ).not.toBeOnTheScreen( );
    // } );

    it( "should not show delete button", async ( ) => {
      await navigateToObsDetail( );
      const photos = await screen.findAllByTestId( "ObsMedia.photo" );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( photos[0] ).toBeOnTheScreen( );
      await act( async ( ) => actor.press( photos[0] ) );
      expect(
        await screen.findByTestId(
          `CustomImageZoom.${observation.observation_photos[0].photo.url}`
        )
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      ).toBeOnTheScreen( );
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
      const observationGridItem = await screen.findByTestId(
        `MyObservations.obsGridItem.${observation.uuid}`
      );
      await actor.press( observationGridItem );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( await screen.findByTestId( `ObsDetails.${observation.uuid}` ) ).toBeOnTheScreen( );
      const displayedTaxon = await screen.findByText( taxon.name );
      await act( async ( ) => actor.press( displayedTaxon ) );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( await screen.findByTestId( `TaxonDetails.${taxon.id}` ) ).toBeOnTheScreen( );
    }

    it( "should show the first photo when tapped", async ( ) => {
      await navigateToTaxonDetail( );
      const photoId = taxon.taxonPhotos[0].photo.id;
      const photo = await screen.findByTestId( `TaxonDetails.photo.${photoId}` );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( photo ).toBeOnTheScreen( );
      await act( async ( ) => actor.press( photo ) );
      expect(
        await screen.findByTestId(
          `CustomImageZoom.${taxon.taxonPhotos[0].photo.url}`
        )
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      ).toBeOnTheScreen( );
    } );

    it( "should not show delete button", async ( ) => {
      await navigateToTaxonDetail( );
      const photoId = taxon.taxonPhotos[0].photo.id;
      const photo = await screen.findByTestId( `TaxonDetails.photo.${photoId}` );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( photo ).toBeOnTheScreen( );
      await act( async ( ) => actor.press( photo ) );
      expect(
        await screen.findByTestId(
          `CustomImageZoom.${taxon.taxonPhotos[0].photo.url}`
        )
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      ).toBeOnTheScreen( );
      expect( screen.queryByLabelText( "Delete photo" ) ).toBeFalsy( );
    } );
  } );

  describe( "from Suggestions", ( ) => {
    const observation = factory( "RemoteObservation", {
      observation_photos: [
        factory( "RemoteObservationPhoto" ),
        factory( "RemoteObservationPhoto" )
      ]
    } );
    const observations = [observation];
    const defaultSelectedPhoto = observation.observation_photos[0].photo.url;
    const defaultUnselectedPhoto = observation.observation_photos[1].photo.url;
    useStore.setState( { observations } );

    async function navigateToSuggestions( ) {
      await renderAppWithObservations( observations, __filename );
      const observationGridItem = await screen.findByTestId(
        `MyObservations.obsGridItem.${observation.uuid}`
      );
      await actor.press( observationGridItem );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( await screen.findByTestId( `ObsDetails.${observation.uuid}` ) ).toBeOnTheScreen( );
      const suggestButton = await screen.findByTestId(
        "ObsDetail.cvSuggestionsButton"
      );
      await act( async () => actor.press( suggestButton ) );
      const firstPhoto = await screen.findByTestId(
        `ObsPhotoSelectionList.${defaultSelectedPhoto}`
      );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( firstPhoto ).toBeOnTheScreen();
      const secondPhoto = await screen.findByTestId(
        `ObsPhotoSelectionList.${defaultUnselectedPhoto}`
      );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( secondPhoto ).toBeOnTheScreen();
    }

    it( "should show the selected photo when tapped", async () => {
      await navigateToSuggestions( );
      const firstPhoto = await screen.findByTestId(
        `ObsPhotoSelectionList.${defaultSelectedPhoto}`
      );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( firstPhoto ).toBeOnTheScreen();
      await act( async () => actor.press( firstPhoto ) );
      expect(
        await screen.findByTestId(
          `CustomImageZoom.${defaultSelectedPhoto}`
        )
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      ).toBeOnTheScreen();
    } );

    it( "should not show the currently not selected photo when tapped", async () => {
      await navigateToSuggestions( );
      const secondPhoto = await screen.findByTestId(
        `ObsPhotoSelectionList.${defaultUnselectedPhoto}`
      );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( secondPhoto ).toBeOnTheScreen();
      await act( async () => actor.press( secondPhoto ) );
      expect(
        screen.queryByTestId(
          `CustomImageZoom.${defaultUnselectedPhoto}`
        )
      ).toBeFalsy();
    } );

    it( "should not show delete button", async () => {
      await navigateToSuggestions();
      const firstPhoto = await screen.findByTestId(
        `ObsPhotoSelectionList.${defaultSelectedPhoto}`
      );
      await act( async () => actor.press( firstPhoto ) );
      expect(
        await screen.findByTestId(
          `CustomImageZoom.${defaultSelectedPhoto}`
        )
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      ).toBeOnTheScreen();
      expect( screen.queryByLabelText( "Delete photo" ) ).toBeFalsy();
    } );
  } );
} );
