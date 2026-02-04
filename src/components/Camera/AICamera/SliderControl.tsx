import Slider from "@react-native-community/slider";
import {
  Body1,
  Heading4,
  P,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import round from "lodash/round";
import React from "react";
import colors from "styles/tailwindColors";

const SLIDER_STYLE = { display: "flex", flexGrow: 1, height: 44 } as const;

interface SliderControlProps {
  name: string;
  value: number;
  setValue: ( value: number ) => void;
  min: number;
  max: number;
  precision?: number;
  step?: number;
}

const SliderControl = ( {
  name,
  value,
  setValue,
  min,
  max,
  precision = 0,
  step = 1,
}: SliderControlProps ) => (
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
        maximumTrackTintColor={colors.black}
        renderStepNumber
        tapToSeek
        step={step}
        value={value}
        onValueChange={changedValue => setValue( changedValue )}
      />
    </View>
  </P>
);

export default SliderControl;
