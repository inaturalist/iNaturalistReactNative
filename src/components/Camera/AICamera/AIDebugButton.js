import Slider from "@react-native-community/slider";
import classnames from "classnames";
import {
  Body1,
  Heading4,
  INatIconButton,
  P
} from "components/SharedComponents";
import {
  CIRCLE_SIZE
} from "components/SharedComponents/Buttons/TransparentCircleButton.tsx";
import { View } from "components/styledComponents";
import { round } from "lodash";
import React, { useState } from "react";
import {
  Modal,
  Portal
} from "react-native-paper";
import { useDebugMode } from "sharedHooks";
import colors from "styles/tailwindColors";

const SLIDER_STYLE = { display: "flex", flexGrow: 1, height: 44 };

const SliderControl = ( {
  name,
  value,
  setValue,
  min,
  max,
  precision = 0,
  step = 1
} ) => (
  <P>
    {/* eslint-disable-next-line i18next/no-literal-string */}
    <Heading4 className="text-white">{ `${name} (${min}-${max})` }</Heading4>
    <View className="flex-row items-center h-fit">
      <Body1 className="w-10 m-3 text-white">{round( value, precision )}</Body1>
      <Slider
        style={SLIDER_STYLE}
        minimumValue={min}
        maximumValue={max}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
        renderStepNumber
        tapToSeek
        step={step}
        value={value}
        onValueChange={changedValue => setValue( changedValue )}
      />
    </View>
  </P>
);

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
    <View className="flex-row justify-end pb-[20px]">
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
              max={1}
              value={confidenceThreshold}
              setValue={setConfidenceThreshold}
              precision={2}
              step={0.05}
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
