// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Heading4, WarningSheet } from "components/SharedComponents";
import { SafeAreaView, View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useContext, useEffect,
  useState
} from "react";
import { BackHandler, StatusBar } from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import { IconButton } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import CustomImageZoom from "./CustomImageZoom";
// import MainPhotoDisplay from "./MainPhotoDisplay";
import PhotoSelector from "./PhotoSelector";

export const PORTRAIT = "portrait";
export const LANDSCAPE_LEFT = "landscapeLeft";
export const LANDSCAPE_RIGHT = "landscapeRight";

type Props = {
  route: {
    params: {
      initialPhotoSelected: number
    }
  }
}

const MediaViewer = ( { route }: Props ): Node => {
  const { initialPhotoSelected } = route.params;
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const [warningSheet, setWarningSheet] = useState( false );
  const { deletePhotoFromObservation, mediaViewerUris } = useContext( ObsEditContext );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState( initialPhotoSelected );

  const photoUris = mediaViewerUris;

  // const horizontalScroll = useRef( null );

  function orientationLocker( orientation ) {
    switch ( orientation ) {
    case "LANDSCAPE-RIGHT":
      return LANDSCAPE_RIGHT;
    case "LANDSCAPE-LEFT":
      return LANDSCAPE_LEFT;
    default:
      return PORTRAIT;
    }
  }

  const [deviceOrientation, setDeviceOrientation] = useState(
    orientationLocker( Orientation.getInitialOrientation( ) )
  );

  const isLandscapeMode = [LANDSCAPE_LEFT, LANDSCAPE_RIGHT].includes( deviceOrientation );
  const isTablet = DeviceInfo.isTablet();

  const numOfPhotos = photoUris.length;

  const showWarningSheet = ( ) => setWarningSheet( true );
  const hideWarningSheet = ( ) => setWarningSheet( false );

  const handleBackButtonPress = useCallback( ( ) => navigation.goBack( ), [navigation] );

  const renderBackButton = useCallback( ( ) => (
    <View className="ml-4">
      <HeaderBackButton
        tintColor={colors.white}
        onPress={handleBackButtonPress}
      />
    </View>
  ), [handleBackButtonPress] );

  useFocusEffect(
    useCallback( ( ) => {
      // make sure an Android user cannot back out to MyObservations with the back arrow
      // and see a stale observation context state
      const onBackPress = ( ) => {
        handleBackButtonPress( );
        return true;
      };

      BackHandler.addEventListener( "hardwareBackPress", onBackPress );

      return ( ) => BackHandler.removeEventListener( "hardwareBackPress", onBackPress );
    }, [handleBackButtonPress] )
  );

  // detect device rotation instead of using screen orientation change
  const onDeviceRotation = useCallback(
    orientation => {
      // FACE-UP and FACE-DOWN could be portrait or landscape, I guess the
      // device can't tell, so I'm just not changing the layout at all for
      // those. ~~~ kueda 20230420
      if ( orientation === "FACE-UP" || orientation === "FACE-DOWN" ) {
        return;
      }
      setDeviceOrientation( orientationLocker( orientation ) );
    },
    [setDeviceOrientation]
  );

  useEffect( () => {
    Orientation.addDeviceOrientationListener( onDeviceRotation );

    return () => {
      Orientation.removeOrientationListener( onDeviceRotation );
    };
  } );

  const deletePhoto = ( ) => {
    deletePhotoFromObservation( photoUris[selectedPhotoIndex] );
    hideWarningSheet( );
    if ( photoUris.length === 0 ) {
      navigation.goBack( );
    } else if ( selectedPhotoIndex !== 0 ) {
      setSelectedPhotoIndex( selectedPhotoIndex - 1 );
    }
  };

  useEffect( ( ) => {
    const renderHeaderTitle = ( ) => (
      <Heading4 className="color-white">{t( "X-PHOTOS", { photoCount: numOfPhotos } )}</Heading4>
    );

    const headerOptions = {
      headerTitle: renderHeaderTitle,
      headerLeft: renderBackButton
    };

    navigation.setOptions( headerOptions );
  }, [navigation, t, numOfPhotos, renderBackButton] );

  const scrollToIndex = useCallback( index => {
    // when a user taps a photo in the carousel, the UI needs to automatically
    // scroll to the index of the photo they selected
    // if ( !horizontalScroll?.current ) { return; }
    setSelectedPhotoIndex( index );
    // horizontalScroll?.current.scrollToIndex( { index, animated: true } );
  }, [setSelectedPhotoIndex] );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      {warningSheet && (
        <WarningSheet
          handleClose={hideWarningSheet}
          confirm={deletePhoto}
          headerText={t( "DISCARD-MEDIA" )}
          snapPoints={[178]}
          buttonText={t( "DISCARD" )}
          secondButtonText={t( "CANCEL" )}
          handleSecondButtonPress={hideWarningSheet}
        />
      )}
      {/* <MainPhotoDisplay
        photoUris={photoUris}
        selectedPhotoIndex={selectedPhotoIndex}
        setSelectedPhotoIndex={setSelectedPhotoIndex}
        scrollToIndex={scrollToIndex}
        horizontalScroll={horizontalScroll}
      /> */}
      <CustomImageZoom source={{ uri: photoUris[selectedPhotoIndex] }} />
      <View className="absolute bottom-[18px]">
        <PhotoSelector
          photoUris={photoUris}
          scrollToIndex={scrollToIndex}
          isLargeScreen={isTablet}
          isLandscapeMode={isLandscapeMode}
          selectedPhotoIndex={selectedPhotoIndex}
        />
      </View>
      <IconButton
        className="absolute right-10 bottom-40"
        onPress={showWarningSheet}
        icon="trash-outline"
        iconColor={colors.white}
        containerColor="rgba(0, 0, 0, 0.5)"
      />
    </SafeAreaView>
  );
};

export default MediaViewer;
