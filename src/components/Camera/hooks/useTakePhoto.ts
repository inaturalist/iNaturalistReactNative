// @flow

import { RealmContext } from "providers/contexts";
import {
  useState
} from "react";
import ObservationPhoto from "realmModels/ObservationPhoto";
import Photo from "realmModels/Photo";
import {
  rotatePhotoPatch,
  rotationLocalPhotoPatch,
  rotationTempPhotoPatch
} from "sharedHelpers/visionCameraPatches";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

const useTakePhoto = ( camera: Object, addEvidence?: boolean, device?: Object ): Object => {
  const realm = useRealm( );
  const currentObservation = useStore( state => state.currentObservation );
  const { deviceOrientation } = useDeviceOrientation( );
  const hasFlash = device?.hasFlash;
  const initialPhotoOptions = {
    enableShutterSound: true,
    ...( hasFlash && { flash: "off" } )
  };
  const deletePhotoFromObservation = useStore( state => state.deletePhotoFromObservation );
  const [takePhotoOptions, setTakePhotoOptions] = useState( initialPhotoOptions );
  const [takingPhoto, setTakingPhoto] = useState( false );

  const setCameraState = useStore( state => state.setCameraState );
  const originalOrRotatedCameraUrisMap = useStore( state => state.originalOrRotatedCameraUrisMap );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const cameraPreviewUris = useStore( state => state.cameraPreviewUris );

  const takePhoto = async ( options = { } ) => {
    const { replaceExisting = false } = options;

    setTakingPhoto( true );
    const cameraPhoto = await camera.current.takePhoto( takePhotoOptions );

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

    if ( ( addEvidence || currentObservation?.observationPhotos?.length > 0 )
      && !replaceExisting ) {
      setCameraState( {
        cameraPreviewUris: cameraPreviewUris.concat( [uri] ),
        evidenceToAdd: [...evidenceToAdd, uri],
        // Remember original or rotated (unresized for upload) camera URI
        originalOrRotatedCameraUrisMap: {
          ...originalOrRotatedCameraUrisMap,
          [uri]: cameraPhoto.path
        }
      } );
    } else {
      if ( replaceExisting && cameraPreviewUris?.length > 0 ) {
        // First, need to delete previously-created observation photo (happens when getting into
        // AI camera, snapping photo, then backing out from suggestions screen)
        const uriToDelete = cameraPreviewUris[0];
        deletePhotoFromObservation( uriToDelete );
        await ObservationPhoto.deletePhoto( realm, uriToDelete, currentObservation );
      }

      setCameraState( {
        cameraPreviewUris: replaceExisting
          ? [uri]
          : cameraPreviewUris.concat( [uri] ),
        evidenceToAdd: replaceExisting
          ? [uri]
          : [...evidenceToAdd, uri],
        // Remember original or rotated (unresized for upload) camera URI
        originalOrRotatedCameraUrisMap: replaceExisting
          ? { [uri]: cameraPhoto.path }
          : { ...originalOrRotatedCameraUrisMap, [uri]: cameraPhoto.path }
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
