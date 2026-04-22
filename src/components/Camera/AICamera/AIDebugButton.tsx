import classnames from "classnames";
import {
  Button,
  Heading4,
  INatIconButton,
} from "components/SharedComponents";
import {
  CIRCLE_SIZE,
} from "components/SharedComponents/Buttons/TransparentCircleButton";
import { Text, View } from "components/styledComponents";
import React, { useState } from "react";
import {
  Modal,
  Portal,
} from "react-native-paper";
import type { CameraDeviceFormat } from "react-native-vision-camera";
import { useDebugMode } from "sharedHooks";
import colors from "styles/tailwindColors";

import SliderControl from "./SliderControl";

interface Props {
  debugFormat: CameraDeviceFormat | null;
  changeDebugFormat: () => void;
  confidenceThreshold: number;
  setConfidenceThreshold: ( value: number ) => void;
  fps: number;
  setFPS: ( value: number ) => void;
  numStoredResults: number;
  setNumStoredResults: ( value: number ) => void;
  cropRatio: number;
  setCropRatio: ( value: number ) => void;
}

const AIDebugButton = ( {
  debugFormat,
  changeDebugFormat,
  confidenceThreshold,
  setConfidenceThreshold,
  fps,
  setFPS,
  numStoredResults,
  setNumStoredResults,
  cropRatio,
  setCropRatio,
}: Props ) => {
  const [modalVisible, setModalVisible] = useState( false );
  const [slideIndex, setSlideIndex] = useState( 0 );
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
          CIRCLE_SIZE,
        )}
        backgroundColor={colors.deeppink}
        onPress={() => setModalVisible( true )}
        accessibilityLabel="Debug"
        accessibilityHint="Show debug tools"
        icon="gear"
        color={colors.white}
        size={20}
      />
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible( false )}
          // eslint-disable-next-line react-native/no-inline-styles
          contentContainerStyle={{ margin: 20 }}
        >
          <View className="p-5 bg-deeppink">
            {slideIndex === 0 && (
              <>
                <Button
                  onPress={() => setSlideIndex( 1 )}
                  className="bg-white"
                  text="Show camera options"
                />
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
              </>
            )}
            {slideIndex === 1 && (
              <>
                <Button
                  onPress={() => setSlideIndex( 0 )}
                  className="bg-white"
                  text="Show prediction options"
                />
                {/* eslint-disable-next-line i18next/no-literal-string */}
                <Heading4 className="text-white">Debug camera format:</Heading4>
                {/* eslint-disable-next-line react-native/no-inline-styles */}
                <Text className="text-white" style={{ fontSize: 8 }}>
                  {JSON.stringify( debugFormat, null, 2 )}
                </Text>
                <Button
                  onPress={() => changeDebugFormat()}
                  className="bg-white"
                  text="Change debug format"
                />
              </>
            )}
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default AIDebugButton;
