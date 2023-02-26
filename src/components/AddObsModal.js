// @flow

import { useNavigation } from "@react-navigation/native";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import * as React from "react";
import ImagePicker from "react-native-image-crop-picker";
import { IconButton, useTheme } from "react-native-paper";

type Props = {
  closeModal: ( ) => void
}

const AddObsModal = ( { closeModal }: Props ): React.Node => {
  const theme = useTheme( );
  // Destructuring obsEdit means that we don't have to wrap every Jest test in ObsEditProvider
  const obsEditContext = React.useContext( ObsEditContext );
  const createObservationNoEvidence = obsEditContext?.createObservationNoEvidence;
  const navigation = useNavigation( );

  const navAndCloseModal = ( screen, params ) => {
    const resetObsEditContext = obsEditContext?.resetObsEditContext;
    // clear previous upload context before navigating
    if ( resetObsEditContext ) {
      resetObsEditContext( );
    }
    if ( screen === "ObsEdit" ) {
      createObservationNoEvidence( );
    }
    // access nested screen
    navigation.navigate( screen, params );
    closeModal( );
  };

  const navToPhotoGallery = async () => {
    const selectedImages = await ImagePicker.openPicker({
      mediaType: "photo",
      multiple: true,
      maxFiles: 20,
      includeExif: true,
      loadingLabelText: "",
    }).then((images) =>
      images.map((image) => {
        const gpsData = image.exif["{GPS}"];
        const latitudeNegative = gpsData.LatitudeRef === "S";
        const longitudeNegative = gpsData.LongitudeRef === "W";

        let latitude = gpsData.Latitude ?? null;
        let longitude = gpsData.Longitude ?? null;

        if (latitude && latitudeNegative) {
          latitude *= -1;
        }

        if (longitude && longitudeNegative) {
          longitude *= -1;
        }

        return {
          timestamp: parseInt(image.creationDate, 10),
          type: "image",
          location: {
            altitude: gpsData.Altitude || 0,
            longitude,
            latitude,
            heading: gpsData.ImgDirection || 0,
            speed: gpsData.Speed || 0,
          },
          image: {
            width: image.width,
            height: image.height,
            filename: image.filename,
            fileSize: image.size,
            playableDuration: null,
            uri: `file://${image.path}`,
          },
        };
      })
    );

    if (selectedImages.length === 1) {
      obsEditContext.createObservationFromGallery(selectedImages[0]);
      navigation.navigate("ObsEdit");
      closeModal();
    }

    
  };

  const navToSoundRecorder = ( ) => navAndCloseModal( "SoundRecorder" );

  const navToStandardCamera = ( ) => navAndCloseModal( "StandardCamera" );

  const navToObsEdit = ( ) => navAndCloseModal( "ObsEdit" );

  const bulletedText = [
    t( "Take-a-photo-with-your-camera" ),
    t( "Upload-a-photo-from-your-gallery" ),
    t( "Record-a-sound" )
  ];

  const renderIconButton = ( icon, className, onPress, accessibilityLabel, testID ) => (
    <IconButton
      testID={testID}
      size={30}
      icon={icon}
      containerColor={theme.colors.secondary}
      iconColor={theme.colors.onSecondary}
      className={className}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    />
  );

  return (
    <>
      <View className="flex-row justify-center">
        <View className="bg-white rounded-xl p-5 mb-12 max-w-sm">
          <Text testID="evidence-text" className="text-2xl">{t( "Evidence" )}</Text>
          <Text className="color-darkGray my-2">{t( "Add-evidence-of-an-organism" )}</Text>
          <Text className="color-darkGray my-2">{t( "You-can" )}</Text>
          {bulletedText.map( string => (
            <Text className="color-darkGray" key={string}>
              {`\u2022 ${string}`}
            </Text>
          ) )}
        </View>
      </View>
      <View className="flex-row items-center justify-center">
        {renderIconButton(
          "camera",
          "mx-5",
          navToStandardCamera,
          t( "Navigates-to-camera" ),
          "camera-button"
        )}
        {renderIconButton(
          "gallery",
          "mx-5",
          navToPhotoGallery,
          t( "Navigate-to-photo-importer" ),
          "import-media-button"
        )}
      </View>
      <View className="flex-row justify-center">
        {renderIconButton(
          "noevidence",
          "mx-2",
          navToObsEdit,
          t( "Navigate-to-observation-edit-screen" ),
          "observe-without-evidence-button"
        )}
        {renderIconButton(
          "close",
          "self-center h-24 w-24 rounded-[99px]",
          ( ) => closeModal( ),
          t( "Close-camera-options-modal" ),
          "close-camera-options-button"
        )}
        {renderIconButton(
          "microphone",
          "mx-2",
          navToSoundRecorder,
          t( "Navigates-to-sound-recorder" ),
          "record-sound-button"
        )}
      </View>
    </>
  );
};

export default AddObsModal;
