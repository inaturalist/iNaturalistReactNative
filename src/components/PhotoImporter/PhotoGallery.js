import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import PermissionGateContainer, { READ_MEDIA_PERMISSIONS }
  from "components/SharedComponents/PermissionGateContainer";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useState
} from "react";
import { InteractionManager, Platform, View } from "react-native";
import * as ImagePicker from "react-native-image-picker";

const MAX_PHOTOS_ALLOWED = 20;

const sleep = ms => new Promise(resolve => {
  setTimeout(resolve, ms);
});

const PhotoGallery = ( ): Node => {
  const navigation = useNavigation( );
  const [photoGalleryShown, setPhotoGalleryShown] = useState( false );
  const [permissionGranted, setPermissionGranted] = useState( false );
  const {
    createObservationFromGallery,
    galleryUris,
    setGalleryUris,
    addGalleryPhotosToCurrentObservation,
    evidenceToAdd,
    setEvidenceToAdd,
    setGroupedPhotos
  } = useContext( ObsEditContext );
  const { params } = useRoute( );
  const skipGroupPhotos = params
    ? params.skipGroupPhotos
    : false;

  const showPhotoGallery = React.useCallback( async () => {
    if ( photoGalleryShown ) {
      return;
    }

    setPhotoGalleryShown( true );

    if ( Platform.OS === "ios" ) {
      // iOS has annoying transition of the screen - that if we don't wait enough time,
      // the launchImageLibrary would halt and not return (and not showing any image picker)
      await sleep( 500 );
    }

    // According to the native code of the image picker library, it never rejects the promise,
    // just returns a response object with errorCode
    const response = await ImagePicker.launchImageLibrary( {
      selectionLimit: MAX_PHOTOS_ALLOWED,
      mediaType: "photo",
      includeBase64: false,
      includeExtra: true,
      forceOldAndroidPhotoPicker: true,
      chooserTitle: t( "Import-Photos-From" ),
      presentationStyle: "fullScreen"
    } );

    if ( !response || response.didCancel || !response.assets || response.errorCode ) {
      // User cancelled selection of photos - close current screen
      navigation.goBack();
      setPhotoGalleryShown( false );
      return;
    }

    const navToObsEdit = () => navigation.navigate( "ObsEdit", { lastScreen: "PhotoGallery" } );

    const selectedImages = response.assets.map( x => ( { image: x } ) );

    setGalleryUris( [...galleryUris, ...response.assets.map( x => x.uri )] );
    if ( skipGroupPhotos ) {
      setEvidenceToAdd( [...evidenceToAdd, ...response.assets.map( x => x.uri )] );
    }

    if ( skipGroupPhotos ) {
      // add any newly selected photos
      // to an existing observation after navigating from ObsEdit
      addGalleryPhotosToCurrentObservation( selectedImages );
      navToObsEdit();
      setPhotoGalleryShown( false );
      return;
    }
    if ( selectedImages.length === 1 ) {
      // create a new observation and skip group photos screen
      createObservationFromGallery( selectedImages[0] );
      navToObsEdit();
      setPhotoGalleryShown( false );
      return;
    }

    setGroupedPhotos( selectedImages.map( photo => ( {
      photos: [photo]
    } ) ) );

    navigation.navigate( "CameraNavigator", { screen: "GroupPhotos" } );
    setPhotoGalleryShown( false );
  }, [
    photoGalleryShown, addGalleryPhotosToCurrentObservation, createObservationFromGallery,
    evidenceToAdd, galleryUris, navigation, setEvidenceToAdd, setGalleryUris, setGroupedPhotos,
    skipGroupPhotos] );

  const onPermissionDenied = () => {
    console.log( "onPermissionDenied" );
  };

  const onPermissionGranted = () => {
    console.log( "onPermissionGranted" );
    setPermissionGranted( true );
  };

  useFocusEffect(
    React.useCallback( () => {
      // This will run when the screen comes into focus.
      let interactionHandle = null;

      // Wait for screen to finish transition
      interactionHandle = InteractionManager.runAfterInteractions( () => {
        if ( permissionGranted && !photoGalleryShown ) {
          console.log( "Calling showPhotoGallery from useFocusEffect" );
          showPhotoGallery();
        }
      } );

      return () => {
        // This runs when the screen goes out of focus
        if ( interactionHandle ) {
          interactionHandle.cancel();
        }
      };
    }, [permissionGranted, photoGalleryShown, showPhotoGallery] )
  );

  return (
    <View>
      {!permissionGranted && (
        <PermissionGateContainer
          permissions={READ_MEDIA_PERMISSIONS}
          title={t( "Observe-and-identify-organisms-from-your-gallery" )}
          titleDenied={t( "Please-Allow-Gallery-Access" )}
          body={t( "Upload-photos-from-your-gallery-and-create-observations" )}
          blockedPrompt={t( "Youve-previously-denied-gallery-permissions" )}
          buttonText={t( "CHOOSE-PHOTOS" )}
          icon="gallery"
          image={require( "images/azmaan-baluch-_ra6NcejHVs-unsplash.jpg" )}
          onPermissionGranted={onPermissionGranted}
          onPermissionDenied={onPermissionDenied}
          onPermissionBlocked={onPermissionDenied}
        />
      )}
    </View>
  );
};

export default PhotoGallery;
