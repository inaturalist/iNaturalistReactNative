// @flow

import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { IconButton, useTheme } from "react-native-paper";

type Props = {
  observation: Object,
  layout?: "horizontal" | "vertical",
  white?: boolean
}

const UploadButton = ( { observation, layout, white }: Props ): Node => {
  const theme = useTheme( );
  const obsEditContext = useContext( ObsEditContext );
  const uploadObservation = obsEditContext?.uploadObservation;
  const setLoading = obsEditContext?.setLoading;

  return (
    <IconButton
      size={33}
      className={
        layout === "horizontal"
          && "absolute bottom-6 left-0"
      }
      icon="upload-saved"
      iconColor={white && theme.colors.onPrimary}
      onPress={async ( ) => {
        setLoading( true );
        await uploadObservation( observation );
        setLoading( false );
      }}
    />
  );
};

export default UploadButton;
