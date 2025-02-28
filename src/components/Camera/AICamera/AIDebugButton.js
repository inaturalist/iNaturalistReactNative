import classnames from "classnames";
import {
  INatIconButton
} from "components/SharedComponents";
import {
  CIRCLE_SIZE
} from "components/SharedComponents/Buttons/TransparentCircleButton.tsx";
import { View } from "components/styledComponents";
import React, { useState } from "react";
import {
  Modal,
  Portal
} from "react-native-paper";
import { useDebugMode } from "sharedHooks";
import colors from "styles/tailwindColors";

import SliderControl from "./SliderControl";

const AIDebugButton = ( {
  confidenceThreshold,
  setConfidenceThreshold,
  fps,
  setFPS,
  numStoredResults,
  setNumStoredResults,
  cropRatio,
  setCropRatio
} ) => {
  const [modalVisible, setModalVisible] = useState( false );
  const { isDebug } = useDebugMode( );
  if ( !isDebug ) return null;

  return (
    <View className="flex-row justify-end">
      <INatIconButton
        className={classnames(
          "bg-deeppink",
          "items-center",
          "justify-center",
          "rounded-full",
          CIRCLE_SIZE
        )}
        backgroundColor={colors.deeppink}
        onPress={( ) => setModalVisible( true )}
        accessibilityLabel="Debug"
        accessibilityHint="Show debug tools"
        icon="gear"
        color={colors.white}
        size={20}
      />
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={( ) => setModalVisible( false )}
          // eslint-disable-next-line react-native/no-inline-styles
          contentContainerStyle={{ margin: 20 }}
        >
          <View className="p-5 bg-deeppink">
            <SliderControl
              name="FPS"
              min={1}
              max={10}
              value={fps}
              setValue={setFPS}
            />
            <SliderControl
              name="Num. Stored Results"
              min={1}
              max={30}
              value={numStoredResults}
              setValue={setNumStoredResults}
            />
            <SliderControl
              name="Confidence Threshold"
              min={0}
              max={100}
              value={confidenceThreshold}
              setValue={setConfidenceThreshold}
            />
            <SliderControl
              name="Center Crop Ratio (Android only)"
              min={0.5}
              max={1}
              value={cropRatio}
              setValue={setCropRatio}
              precision={2}
              step={0.05}
            />
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default AIDebugButton;
