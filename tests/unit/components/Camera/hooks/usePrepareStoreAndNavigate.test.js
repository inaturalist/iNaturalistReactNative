import { act, renderHook } from "@testing-library/react-native";
import savePhotosToPhotoLibrary from "components/Camera/helpers/savePhotosToPhotoLibrary";
import usePrepareStoreAndNavigate from "components/Camera/hooks/usePrepareStoreAndNavigate";
import DeviceInfo from "react-native-device-info";
import ObservationPhoto from "realmModels/ObservationPhoto";
import useStore from "stores/useStore";
import factory from "tests/factory";

const mockNavigate = jest.fn( );
jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( { navigate: mockNavigate, push: jest.fn( ) } ),
    useRoute: ( ) => ( { params: { addEvidence: true } } ),
  };
} );

jest.mock( "components/Camera/helpers/savePhotosToPhotoLibrary", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

const addEvidenceFromCamera = async ( ) => {
  const { result } = renderHook( ( ) => usePrepareStoreAndNavigate( ) );
  await act( async ( ) => {
    await result.current( {
      userLocation: null,
      logStageIfAICamera: jest.fn( ),
      completeStageIfAICamera: jest.fn( ),
    } );
  } );
};

describe( "usePrepareStoreAndNavigate", ( ) => {
  beforeEach( ( ) => {
    DeviceInfo.getFreeDiskStorage.mockResolvedValue( 1_000_000_000 );
    jest.spyOn( ObservationPhoto, "createObsPhotosWithPosition" ).mockResolvedValue( [] );
    const observation = factory( "LocalObservation" );
    useStore.setState( {
      observations: [observation],
      currentObservation: observation,
      currentObservationIndex: 0,
      evidenceToAdd: ["file:///new-photo.jpg"],
      cameraRollUris: [],
      savingPhoto: false,
    } );
  } );

  describe( "when adding evidence", ( ) => {
    it( "should stop saving after photos are saved to the photo library", async ( ) => {
      savePhotosToPhotoLibrary.mockResolvedValue( ["content://saved-photo"] );
      await addEvidenceFromCamera( );
      expect( savePhotosToPhotoLibrary ).toHaveBeenCalled( );
      expect( useStore.getState( ).cameraRollUris ).toEqual( ["content://saved-photo"] );
      expect( useStore.getState( ).savingPhoto ).toBe( false );
    } );

    it( "should stop saving when photo library permission is denied", async ( ) => {
      savePhotosToPhotoLibrary.mockResolvedValue( [] );
      await addEvidenceFromCamera( );
      expect( savePhotosToPhotoLibrary ).toHaveBeenCalled( );
      expect( useStore.getState( ).savingPhoto ).toBe( false );
    } );

    it( "should stop saving when saving to the photo library fails", async ( ) => {
      savePhotosToPhotoLibrary.mockRejectedValue( new Error( "save failed" ) );
      await addEvidenceFromCamera( );
      expect( savePhotosToPhotoLibrary ).toHaveBeenCalled( );
      expect( useStore.getState( ).savingPhoto ).toBe( false );
    } );
  } );
} );
