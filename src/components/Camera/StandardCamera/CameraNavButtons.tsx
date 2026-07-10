import TakePhoto from "components/Camera/Buttons/TakePhoto";
import { MediaNavButtons } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import DeviceInfo from "react-native-device-info";

const isTablet = DeviceInfo.isTablet();

interface Props {
  disabled: boolean;
  confirmDisabled: boolean;
  handleCheckmarkPress: ( ) => void;
  handleClose: ( ) => void;
  photosTaken: boolean;
  rotatableAnimatedStyle: object;
  takePhoto: ( ) => Promise<void>;
}

const CameraNavButtons = ( {
  disabled,
  confirmDisabled,
  handleCheckmarkPress,
  handleClose,
  photosTaken,
  rotatableAnimatedStyle,
  takePhoto,
}: Props ) => {
  if ( isTablet ) return null;

  return (
    <View testID="CameraNavButtons">
      <MediaNavButtons
        disabled={confirmDisabled}
        mediaCaptured={photosTaken}
        onClose={handleClose}
        onConfirm={handleCheckmarkPress}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
      >
        <TakePhoto
          disabled={disabled}
          takePhoto={takePhoto}
        />
      </MediaNavButtons>
    </View>
  );
};

export default CameraNavButtons;
