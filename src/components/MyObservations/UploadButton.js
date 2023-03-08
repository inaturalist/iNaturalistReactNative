// @flow

import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { IconButton } from "react-native-paper";

type Props = {
  observation: Object
}

const UploadButton = ( { observation }: Props ): Node => {
  const obsEditContext = useContext( ObsEditContext );
  const uploadObservation = obsEditContext?.uploadObservation;
  const setLoading = obsEditContext?.setLoading;

  return (
    <IconButton
      size={40}
      icon="upload-saved"
      onPress={async ( ) => {
        setLoading( true );
        await uploadObservation( observation );
        setLoading( false );
      }}
    />
  );
};

export default UploadButton;
