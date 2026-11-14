import { TextInput } from "components/styledComponents";
import React, { useRef } from "react";
import type { TextInput as RNTextInput } from "react-native";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import useObservationFieldValue from "../hooks/useObservationFieldValue";

interface Props {
  obsFieldId: number;
  onInputFocus?: ( input: RNTextInput | null ) => void;
}

const TextFieldInput = ( { obsFieldId, onInputFocus }: Props ) => {
  const { t } = useTranslation( );
  const { value, setValue } = useObservationFieldValue( obsFieldId );
  const inputRef = useRef<RNTextInput>( null );

  return (
    <TextInput
      ref={inputRef}
      accessibilityLabel={t( "Enter-a-response" )}
      className="pt-1 text-xs font-Lato-Regular color-black"
      placeholder={t( "Enter-a-response" )}
      placeholderTextColor={colors.darkGrayDisabled}
      multiline
      value={value}
      onChangeText={setValue}
      onFocus={( ) => onInputFocus?.( inputRef.current )}
      onBlur={( ) => onInputFocus?.( null )}
    />
  );
};

export default TextFieldInput;
