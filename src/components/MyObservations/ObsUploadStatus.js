// @flow

import { UploadStatus } from "components/SharedComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { useTheme } from "react-native-paper";
import useCurrentUser from "sharedHooks/useCurrentUser";

import ObsStatus from "./ObsStatus";

type Props = {
  observation: Object,
  layout?: "horizontal" | "vertical",
  white?: boolean,
  classNameMargin?: string,
  setShowLoginSheet: Function
};

const ObsUploadStatus = ( {
  observation,
  layout,
  white = false,
  classNameMargin,
  setShowLoginSheet
}: Props ): Node => {
  const theme = useTheme( );
  const currentUser = useCurrentUser( );
  const obsEditContext = useContext( ObsEditContext );
  const startSingleUpload = obsEditContext?.startSingleUpload;
  const uploadProgress = obsEditContext?.uploadProgress;
  const whiteColor = white && theme.colors.onPrimary;

  const displayUploadStatus = ( ) => {
    const obsStatus = (
      <ObsStatus
        observation={observation}
        layout={layout}
        white={white}
        classNameMargin={classNameMargin}
      />
    );

    const progress = uploadProgress?.[observation.uuid];
    if ( !observation.id || typeof progress === "number" ) {
      return (
        <UploadStatus
          progress={progress || 0}
          startSingleUpload={() => {
            if ( !currentUser ) {
              setShowLoginSheet( true );
              return;
            }
            startSingleUpload( observation );
          }}
          color={whiteColor}
          completeColor={whiteColor}
          layout={layout}
        >
          {obsStatus}
        </UploadStatus>
      );
    }
    return obsStatus;
  };

  return displayUploadStatus( );
};

export default ObsUploadStatus;
