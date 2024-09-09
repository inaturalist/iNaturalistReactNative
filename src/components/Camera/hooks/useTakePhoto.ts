import { RealmContext } from "providers/contexts.ts";
import React, {
  useState
} from "react";
import {
  Camera, CameraDevice, PhotoFile, TakePhotoOptions
} from "react-native-vision-camera";
import ObservationPhoto from "realmModels/ObservationPhoto";
import {
  rotatePhotoPatch,
  rotationTempPhotoPatch
} from "sharedHelpers/visionCameraPatches";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation.ts";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

const useTakePhoto = (
  camera: React.RefObject<Camera>,
  addEvidence?: boolean,
  device?: CameraDevice
): Object => {
  const realm = useRealm( );
  const { deviceOrientation } = useDeviceOrientation( );

  const currentObservation = useStore( state => state.currentObservation );
  const deletePhotoFromObservation = useStore( state => state.deletePhotoFromObservation );
  const setCameraState = useStore( state => state.setCameraState );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const cameraUris = useStore( state => state.cameraUris );

  const hasFlash = device?.hasFlash;
  const initialPhotoOptions = {
    // We had this set to true in Seek but received many reports of it not respecting OS-wide sound
    // level and scared away wildlife. So maybe better to just disable it.
    enableShutterSound: false,
    ...( hasFlash && { flash: "off" } as const )
  } as const;
  const [takePhotoOptions, setTakePhotoOptions] = useState<TakePhotoOptions>( initialPhotoOptions );
  const [takingPhoto, setTakingPhoto] = useState( false );

  const saveRotatedPhotoToDocumentsDirectory = async ( cameraPhoto: PhotoFile ) => {
    // Rotate the original photo depending on device orientation
    const photoRotation = rotationTempPhotoPatch( cameraPhoto, deviceOrientation );
    return rotatePhotoPatch( cameraPhoto, photoRotation );
  };

  const updateStore = async ( uri, options ) => {
    const { replaceExisting = false } = options;

    if ( ( addEvidence || currentObservation?.observationPhotos?.length > 0 )
      && !replaceExisting ) {
      setCameraState( {
        cameraUris: cameraUris.concat( [uri] ),
        evidenceToAdd: [...evidenceToAdd, uri]
      } );
    } else {
      if ( replaceExisting && cameraUris?.length > 0 ) {
        // First, need to delete previously-created observation photo (happens when getting into
        // AI camera, snapping photo, then backing out from suggestions screen)
        const uriToDelete = cameraUris[0];
        deletePhotoFromObservation( uriToDelete );
        await ObservationPhoto.deletePhoto( realm, uriToDelete, currentObservation );
      }

      setCameraState( {
        cameraUris: replaceExisting
          ? [uri]
          : cameraUris.concat( [uri] ),
        evidenceToAdd: replaceExisting
          ? [uri]
          : [...evidenceToAdd, uri]
      } );
    }
  };

  interface Options {
    photoTakenCallback?: () => void,
    replaceExisting?: boolean
  }
  const takePhoto = async ( options: Options ) => {
    setTakingPhoto( true );
    const cameraPhoto = await camera.current.takePhoto( takePhotoOptions );
    if ( options.photoTakenCallback ) options.photoTakenCallback();
    const uri = await saveRotatedPhotoToDocumentsDirectory( cameraPhoto );
    await updateStore( uri, options );
    setTakingPhoto( false );
    return uri;
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
