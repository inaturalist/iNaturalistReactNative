// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import classnames from "classnames";
import { Heading4, TransparentCircleButton, WarningSheet } from "components/SharedComponents";
import { SafeAreaView, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useEffect, useRef,
  useState
} from "react";
import { StatusBar } from "react-native";
import ObservationPhoto from "realmModels/ObservationPhoto";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useTranslation from "sharedHooks/useTranslation";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

import MainPhotoDisplay from "./MainPhotoDisplay";
import PhotoSelector from "./PhotoSelector";

const { useRealm } = RealmContext;

const MediaViewer = ( ): Node => {
  const realm = useRealm( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState( params?.index );
  const { t } = useTranslation( );
  const [warningSheet, setWarningSheet] = useState( false );
  const photoEvidenceUris = useStore( state => state.photoEvidenceUris );
  const deletePhotoFromObservation = useStore( state => state.deletePhotoFromObservation );
  const currentObservation = useStore( state => state.currentObservation );

  const atFirstPhoto = selectedPhotoIndex === 0;
  const atLastPhoto = selectedPhotoIndex === photoEvidenceUris.length - 1;

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

  const numOfPhotos = photoEvidenceUris.length;

  const showWarningSheet = ( ) => setWarningSheet( true );
  const hideWarningSheet = ( ) => setWarningSheet( false );

  const deletePhoto = async ( ) => {
    const uriToDelete = photoEvidenceUris[selectedPhotoIndex];
    deletePhotoFromObservation( uriToDelete );
    await ObservationPhoto.deletePhoto( realm, uriToDelete, currentObservation );
    hideWarningSheet( );
    if ( photoEvidenceUris.length === 0 ) {
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
      headerTitle: renderHeaderTitle
    };

    navigation.setOptions( headerOptions );
  }, [navigation, t, numOfPhotos] );

  const scrollToIndex = useCallback( index => {
    // when a user taps a photo in the carousel, the UI needs to automatically
    // scroll to the index of the photo they selected
    setSelectedPhotoIndex( index );
    horizontalScroll?.current?.scrollToIndex( { index, animated: true } );
  }, [setSelectedPhotoIndex] );

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
          buttonText={t( "DISCARD" )}
          secondButtonText={t( "CANCEL" )}
          handleSecondButtonPress={hideWarningSheet}
        />
      )}
      <MainPhotoDisplay
        photoUris={photoEvidenceUris}
        selectedPhotoIndex={selectedPhotoIndex}
        handleScrollEndDrag={handleScrollEndDrag}
        horizontalScroll={horizontalScroll}
      />
      <PhotoSelector
        photoUris={photoEvidenceUris}
        scrollToIndex={scrollToIndex}
        isLargeScreen={isLargeScreen}
        isLandscapeMode={isLandscapeMode}
        selectedPhotoIndex={selectedPhotoIndex}
      />
      <View
        className={classnames(
          "absolute right-[14px]",
          {
            "bottom-[138px]": isLargeScreen,
            "bottom-[91px]": !isLargeScreen
          }
        )}
      >
        <TransparentCircleButton
          onPress={showWarningSheet}
          icon="trash-outline"
          color={colors.white}
          accessibilityLabel={t( "Delete" )}
        />
      </View>
    </SafeAreaView>
  );
};

export default MediaViewer;
