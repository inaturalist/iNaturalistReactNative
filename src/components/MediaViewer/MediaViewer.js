// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { Heading4, WarningSheet } from "components/SharedComponents";
import { SafeAreaView, View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useContext, useEffect, useRef,
  useState
} from "react";
import { BackHandler, StatusBar } from "react-native";
import { IconButton } from "react-native-paper";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import MainPhotoDisplay from "./MainPhotoDisplay";
import PhotoSelector from "./PhotoSelector";

const MediaViewer = ( ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const [warningSheet, setWarningSheet] = useState( false );
  const {
    deletePhotoFromObservation,
    mediaViewerUris,
    selectedPhotoIndex,
    setSelectedPhotoIndex
  } = useContext( ObsEditContext );

  const atFirstPhoto = selectedPhotoIndex === 0;
  const atLastPhoto = selectedPhotoIndex === mediaViewerUris.length - 1;

  const handleScrollLeft = index => {
    if ( atFirstPhoto ) { return; }
    setSelectedPhotoIndex( index );
  };

  const handleScrollRight = index => {
    if ( atLastPhoto ) { return; }
    setSelectedPhotoIndex( index );
  };

  const horizontalScroll = useRef( null );

  const { isLandscapeMode, screenWidth } = useDeviceOrientation( );
  const isLargeScreen = screenWidth > BREAKPOINTS.md;

  const numOfPhotos = mediaViewerUris.length;

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

  const deletePhoto = ( ) => {
    deletePhotoFromObservation( mediaViewerUris[selectedPhotoIndex] );
    hideWarningSheet( );
    if ( mediaViewerUris.length === 0 ) {
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
    setSelectedPhotoIndex( index );
    horizontalScroll?.current?.scrollToIndex( { index, animated: true } );
  }, [setSelectedPhotoIndex] );

  const handleArrowPressLeft = ( ) => {
    if ( atFirstPhoto ) { return; }
    scrollToIndex( selectedPhotoIndex - 1 );
  };

  const handleArrowPressRight = ( ) => {
    if ( atLastPhoto ) { return; }
    scrollToIndex( selectedPhotoIndex + 1 );
  };

  const handleScrollEndDrag = e => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const { x } = contentOffset;

    const currentOffset = screenWidth * selectedPhotoIndex;

    // https://gist.github.com/dozsolti/6d01d0f96d9abced3450a2e6149a2bc3?permalink_comment_id=4107663#gistcomment-4107663
    const index = Math.floor(
      Math.floor( x ) / Math.floor( layoutMeasurement.width )
    );

    if ( x > currentOffset ) {
      handleScrollRight( index );
    } else if ( x < currentOffset ) {
      handleScrollLeft( index );
    }
  };

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
      <MainPhotoDisplay
        photoUris={mediaViewerUris}
        selectedPhotoIndex={selectedPhotoIndex}
        handleScrollEndDrag={handleScrollEndDrag}
        horizontalScroll={horizontalScroll}
      />
      {!atFirstPhoto && (
        <View className="absolute top-1/2 -mt-[26px] left-0">
          <IconButton
            onPress={handleArrowPressLeft}
            icon="chevron-left-circle"
            iconColor={colors.white}
            size={26}
          />
        </View>
      )}
      {!atLastPhoto && (
        <View className="absolute top-1/2 -mt-[26px] right-0">
          <IconButton
            onPress={handleArrowPressRight}
            icon="chevron-right-circle"
            iconColor={colors.white}
            size={26}
          />
        </View>
      )}
      <PhotoSelector
        photoUris={mediaViewerUris}
        scrollToIndex={scrollToIndex}
        isLargeScreen={isLargeScreen}
        isLandscapeMode={isLandscapeMode}
        selectedPhotoIndex={selectedPhotoIndex}
      />
      <IconButton
        className={classnames(
          "absolute right-[14px]",
          {
            "bottom-[138px]": isLargeScreen,
            "bottom-[91px]": !isLargeScreen
          }
        )}
        onPress={showWarningSheet}
        icon="trash-outline"
        iconColor={colors.white}
        containerColor="rgba(0, 0, 0, 0.5)"
      />
    </SafeAreaView>
  );
};

export default MediaViewer;
