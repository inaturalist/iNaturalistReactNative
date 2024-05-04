import {
  useState
} from "react";
import type { PhotoFile } from "react-native-vision-camera";
import Photo from "realmModels/Photo";
import {
  rotatePhotoPatch,
  rotationLocalPhotoPatch,
  rotationTempPhotoPatch
} from "sharedHelpers/visionCameraPatches";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useStore from "stores/useStore";

const useTakePhoto = ( camera: Object, addEvidence: boolean, device: Object ): Object => {
  const currentObservation = useStore( state => state.currentObservation );
  const { deviceOrientation } = useDeviceOrientation( );
  const hasFlash = device?.hasFlash;
  const initialPhotoOptions = {
    enableShutterSound: true,
    ...( hasFlash && { flash: "off" } )
  };
  const [takePhotoOptions, setTakePhotoOptions] = useState( initialPhotoOptions );
  const [takingPhoto, setTakingPhoto] = useState( false );

  const setCameraState = useStore( state => state.setCameraState );
  const originalCameraUrisMap = useStore( state => state.originalCameraUrisMap );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const cameraPreviewUris = useStore( state => state.cameraPreviewUris );

  const takePhoto = async ( ) => {
    setTakingPhoto( true );
    const cameraPhoto: PhotoFile = await camera.current.takePhoto( takePhotoOptions );

    // Rotate the original photo depending on device orientation
    const photoRotation = rotationTempPhotoPatch( cameraPhoto, deviceOrientation );
    await rotatePhotoPatch( cameraPhoto, photoRotation );

    // Get the rotation for the local photo
    const rotationLocalPhoto = rotationLocalPhotoPatch( );

    // Create a local copy photo of the original
    const newPhoto = await Photo.new( cameraPhoto.path, {
      rotation: rotationLocalPhoto
    } );
    const uri = newPhoto.localFilePath;

    if ( addEvidence || currentObservation?.observationPhotos?.length > 0 ) {
      setCameraState( {
        cameraPreviewUris: cameraPreviewUris.concat( [uri] ),
        evidenceToAdd: [...evidenceToAdd, uri],
        // Remember original (unresized) camera URI
        originalCameraUrisMap: { ...originalCameraUrisMap, [uri]: cameraPhoto.path }
      } );
    } else {
      setCameraState( {
        cameraPreviewUris: cameraPreviewUris.concat( [uri] ),
        // Remember original (unresized) camera URI
        originalCameraUrisMap: { ...originalCameraUrisMap, [uri]: cameraPhoto.path }
      } );
    }
    setTakingPhoto( false );
  };

  const toggleFlash = ( ) => {
    setTakePhotoOptions( {
      ...takePhotoOptions,
      flash: takePhotoOptions.flash === "on"
        ? "off"
        : "on"
    } );
  };

  return {
    takePhoto,
    takePhotoOptions,
    takingPhoto,
    toggleFlash
  };
};

export default useTakePhoto;
