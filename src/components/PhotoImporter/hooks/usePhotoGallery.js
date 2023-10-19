import { useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import { useContext } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import * as ImagePicker from "react-native-image-picker";
import { PERMISSIONS } from "react-native-permissions";
import { PERMISSION_GRANTED, requestMultiplePermissions } from "sharedHelpers/permissions";

const MAX_PHOTOS_ALLOWED = 20;
const usePhotoGallery = ( ) => {
  const {
    createObservationFromGallery,
    galleryUris,
    setGalleryUris,
    addGalleryPhotosToCurrentObservation,
    evidenceToAdd,
    setEvidenceToAdd,
    setGroupedPhotos
  } = useContext( ObsEditContext );
  const navigation = useNavigation();

  const showPhotoGallery = async ( skipGroupPhotos = false ) => {
    const isiOS = Platform.OS === "ios";
    const usesAndroid13Permissions = Platform.OS === "android" && Platform.Version >= 33;
    const usesAndroid10Permissions = Platform.OS === "android" && Platform.Version <= 29;
    const androidReadPermissions = usesAndroid13Permissions
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    let permissions = [];

    if ( !isiOS ) {
      if ( usesAndroid10Permissions ) {
        permissions = [
          androidReadPermissions,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION
        ];
      } else {
        permissions = [
          androidReadPermissions,
          PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION
        ];
      }
    } else {
      permissions = [PERMISSIONS.IOS.PHOTO_LIBRARY,
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE];
    }

    const result = await requestMultiplePermissions( permissions );

    if ( result !== PERMISSION_GRANTED ) {
      return;
    }

    ImagePicker.launchImageLibrary( {
      selectionLimit: MAX_PHOTOS_ALLOWED,
      mediaType: "photo",
      includeBase64: false,
      includeExtra: true,
      forceOldAndroidPhotoPicker: true,
      chooserTitle: t( "Import-Photos-From" )
    }, async r => {
      const navToObsEdit = () => navigation.navigate( "ObsEdit", { lastScreen: "PhotoGallery" } );

      const selectedImages = r.assets.map( x => ( { image: x } ) );

      setGalleryUris( [...galleryUris, ...r.assets.map( x => x.uri )] );
      if ( skipGroupPhotos ) {
        setEvidenceToAdd( [...evidenceToAdd, ...r.assets.map( x => x.uri )] );
      }

      if ( skipGroupPhotos ) {
        // add any newly selected photos
        // to an existing observation after navigating from ObsEdit
        addGalleryPhotosToCurrentObservation( selectedImages );
        navToObsEdit();
        return;
      }
      if ( selectedImages.length === 1 ) {
        // create a new observation and skip group photos screen
        createObservationFromGallery( selectedImages[0] );
        navToObsEdit();
      }

      setGroupedPhotos( selectedImages.map( photo => ( {
        photos: [photo]
      } ) ) );

      navigation.navigate( "CameraNavigator", { screen: "GroupPhotos" } );
    } );
  };

  return showPhotoGallery;
};

export default usePhotoGallery;
