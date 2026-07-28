import { TextInput } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import useObservationFieldValue from "../hooks/useObservationFieldValue";

interface Props {
  obsFieldId: number;
}

const TextFieldInput = ( { obsFieldId }: Props ) => {
  const { t } = useTranslation( );
  const { value, setValue } = useObservationFieldValue( obsFieldId );

  return (
    <TextInput
      accessibilityLabel={t( "Enter-a-response" )}
      className="pt-1 text-xs font-Lato-Regular color-black"
      placeholder={t( "Enter-a-response" )}
      placeholderTextColor={colors.darkGrayDisabled}
      multiline
      value={value}
      onChangeText={setValue}
    />
  );
};

export default TextFieldInput;
