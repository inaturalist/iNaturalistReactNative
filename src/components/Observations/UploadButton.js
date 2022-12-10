// @flow

import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { IconButton } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  observation: Object
}

const UploadButton = ( { observation }: Props ): Node => {
  const { uploadObservation, setLoading } = useContext( ObsEditContext );

  return (
    <IconButton
      size={40}
      icon="arrow-up-circle-outline"
      iconColor={colors.borderGray}
      onPress={( ) => {
        setLoading( true );
        uploadObservation( observation );
      }}
    />
  );
};

export default UploadButton;
