import { TextInput } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import useObservationFieldValue from "../hooks/useObservationFieldValue";

interface Props {
  obsFieldId: number;
}

const NumericFieldInput = ( { obsFieldId }: Props ) => {
  const { t } = useTranslation( );
  const { value, setValue } = useObservationFieldValue( obsFieldId );

  return (
    <TextInput
      accessibilityLabel={t( "Enter-a-number" )}
      className="pt-1 text-xs font-Lato-Regular color-black"
      keyboardType="decimal-pad"
      placeholder={t( "Enter-a-number" )}
      placeholderTextColor={colors.darkGrayDisabled}
      numberOfLines={1}
      value={value}
      onChangeText={setValue}
    />
  );
};

export default NumericFieldInput;
