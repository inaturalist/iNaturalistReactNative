import { CommonActions } from "@react-navigation/native";
import { act, waitFor } from "@testing-library/react-native";
import PhotoSharing from "components/PhotoSharing";
import React from "react";
import { Alert } from "react-native";
import Observation from "realmModels/Observation";
import { useLayoutPrefs } from "sharedHooks";
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

jest.mock( "realmModels/Observation" );
jest.mock( "stores/useStore" );
jest.mock( "sharedHooks" );

const JPEG = "image/jpeg";

const mockNavigate = jest.fn( );
const mockDispatch = jest.fn( );
const mockGoBack = jest.fn( );
const mockAddListener = jest.fn( ( ) => ( ) => {} );
const mockUseRoute = jest.fn( );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockNavigate,
      dispatch: mockDispatch,
      goBack: mockGoBack,
      addListener: mockAddListener,
    } ),
    useRoute: ( ) => mockUseRoute( ),
  };
} );

const createMockRoute = item => ( { params: { item } } );

const setupMocks = ( overrides = {} ) => {
  const defaults = {
    resetObservationFlowSlice: jest.fn( ),
    prepareObsEdit: jest.fn( ),
    setPhotoImporterState: jest.fn( ),
    isDefaultMode: true,
    screenAfterPhotoEvidence: "ObsEdit",
  };

  const mocks = { ...defaults, ...overrides };

  useStore.mockImplementation( selector => selector( {
    resetObservationFlowSlice: mocks.resetObservationFlowSlice,
    prepareObsEdit: mocks.prepareObsEdit,
    setPhotoImporterState: mocks.setPhotoImporterState,
  } ) );

  useLayoutPrefs.mockReturnValue( {
    screenAfterPhotoEvidence: mocks.screenAfterPhotoEvidence,
    isDefaultMode: mocks.isDefaultMode,
  } );

  Observation.createObservationWithPhotos.mockResolvedValue( { description: "" } );

  return {
    ...mocks,
    navigate: mockNavigate,
    dispatch: mockDispatch,
    goBack: mockGoBack,
    addListener: mockAddListener,
  };
};

const mockShare = {
  data: [{ data: "file://photo.jpg", mimeType: "image/jpeg" }],
};

const expectNavigationReset = ( mockDispatch, screenName, lastScreen = "PhotoSharing" ) => {
  expect( mockDispatch ).toHaveBeenCalledWith(
    CommonActions.reset( {
      index: 0,
      routes: [{
        name: "NoBottomTabStackNavigator",
        state: {
          index: 0,
          routes: [{ name: screenName, params: { lastScreen } }],
        },
      }],
    } ),
  );
};

describe( "PhotoSharing", ( ) => {
  beforeEach( ( ) => {
    jest.clearAllMocks( );
  } );

  describe( "Share Single Photo", ( ) => {
    const singlePhotoData = {
      ...mockShare,
      extraData: { userInput: "Share photo with description" },
    };

    it( "should handle single photo in default mode", async ( ) => {
      const mocks = setupMocks( );
      mockUseRoute.mockReturnValue( createMockRoute( singlePhotoData ) );

      renderComponent( <PhotoSharing /> );

      await waitFor( ( ) => {
        expect( mocks.dispatch ).toHaveBeenCalled( );
      } );

      expect( mocks.resetObservationFlowSlice ).toHaveBeenCalled( );
      expect( Observation.createObservationWithPhotos ).toHaveBeenCalledWith( [
        { image: { uri: "file://photo.jpg" } },
      ] );
      expect( mocks.prepareObsEdit ).toHaveBeenCalledWith(
        expect.objectContaining( { description: "Share photo with description" } ),
      );
      expectNavigationReset( mocks.dispatch, "Match" );
    } );

    it( "should handle single photo in advanced mode", async ( ) => {
      const mocks = setupMocks( { isDefaultMode: false, screenAfterPhotoEvidence: "ObsEdit" } );
      mockUseRoute.mockReturnValue( createMockRoute( singlePhotoData ) );

      renderComponent( <PhotoSharing /> );

      await waitFor( ( ) => {
        expectNavigationReset( mocks.dispatch, "ObsEdit" );
      } );
    } );

    it( "should handle observation creation error", async ( ) => {
      const alertSpy = jest.spyOn( Alert, "alert" ).mockImplementation( ( ) => {} );

      const mocks = setupMocks( );
      const error = new Error( "Creation failed" );
      Observation.createObservationWithPhotos.mockRejectedValue( error );
      mockUseRoute.mockReturnValue( createMockRoute( singlePhotoData ) );

      renderComponent( <PhotoSharing /> );

      await waitFor( ( ) => {
        expect( alertSpy ).toHaveBeenCalledWith(
          "Photo sharing failed: couldn't create new observation:",
          error,
        );
      } );
      expect( mocks.dispatch ).not.toHaveBeenCalled( );
    } );

    it( "should handle photo with no description", async ( ) => {
      const mocks = setupMocks( );

      mockUseRoute.mockReturnValue( createMockRoute( mockShare ) );

      renderComponent( <PhotoSharing /> );

      await waitFor( ( ) => {
        expect( mocks.prepareObsEdit ).toHaveBeenCalledWith(
          expect.objectContaining( { description: undefined } ),
        );
      } );
    } );
  } );

  describe( "Share Multiple Photos", ( ) => {
    const multiplePhotosData = {
      mimeType: JPEG,
      data: [
        { data: "file://photo1.jpg", mimeType: JPEG },
        { data: "file://photo2.jpg", mimeType: JPEG },
      ],
      extraData: { userInput: "Multiple photos" },
    };

    it( "should navigate to GroupPhotos for multiple photos", async ( ) => {
      const mocks = setupMocks( );
      mockUseRoute.mockReturnValue( createMockRoute( multiplePhotosData ) );

      renderComponent( <PhotoSharing /> );

      await waitFor( ( ) => {
        expect( mocks.setPhotoImporterState ).toHaveBeenCalledWith( {
          photoLibraryUris: ["file://photo1.jpg", "file://photo2.jpg"],
          groupedPhotos: [
            { photos: [{ image: { uri: "file://photo1.jpg" } }] },
            { photos: [{ image: { uri: "file://photo2.jpg" } }] },
          ],
          firstObservationDefaults: { description: "Multiple photos" },
        } );
      } );
      expectNavigationReset( mocks.dispatch, "GroupPhotos" );
      expect( Observation.createObservationWithPhotos ).not.toHaveBeenCalled( );
    } );

    it( "should filter out non-image files", async ( ) => {
      const mocks = setupMocks( );
      const mixedData = {
        ...multiplePhotosData,
        data: [
          { data: "file://photo1.jpg", mimeType: JPEG },
          { data: "file://doc.pdf", mimeType: "application/pdf" },
          { data: "file://photo2.png", mimeType: "image/png" },
        ],
      };
      mockUseRoute.mockReturnValue( createMockRoute( mixedData ) );

      renderComponent( <PhotoSharing /> );

      await waitFor( ( ) => {
        expect( mocks.setPhotoImporterState ).toHaveBeenCalledWith(
          expect.objectContaining( {
            photoLibraryUris: ["file://photo1.jpg", "file://photo2.png"],
          } ),
        );
      } );
    } );
  } );

  describe( "Back navigation", ( ) => {
    it( "should handle expected behavior for blur/focus navigation", async ( ) => {
      const mocks = setupMocks( );
      const testItem = mockShare;
      const testRoute = createMockRoute( testItem );
      let blurCallback;
      let focusCallback;

      mocks.addListener.mockImplementation( ( event, callback ) => {
        if ( event === "blur" ) blurCallback = callback;
        if ( event === "focus" ) focusCallback = callback;
        return ( ) => {};
      } );

      mockUseRoute.mockReturnValue( testRoute );

      renderComponent( <PhotoSharing /> );

      // first time on screen
      act( ( ) => {
        focusCallback( );
      } );

      // navigate forward in the direction of ObsEdit
      act( ( ) => {
        blurCallback( );
      } );

      // same item -- simulate user coming back to this screen by backing out
      mockUseRoute.mockReturnValue( testRoute );

      // return to PhotoSharing screen
      act( ( ) => {
        focusCallback( );
      } );

      expect( mocks.goBack ).toHaveBeenCalled( );
    } );
  } );
} );
