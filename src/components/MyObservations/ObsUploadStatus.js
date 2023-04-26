// @flow

import { UploadStatus } from "components/SharedComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { useTheme } from "react-native-paper";
import useCurrentUser from "sharedHooks/useCurrentUser";

import ObsStatus from "./ObsStatus";
import UploadCompleteAnimation from "./UploadIcons/UploadCompleteAnimation";

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
  const wasSynced = observation.wasSynced( );
  const whiteColor = white && theme.colors.onPrimary;

  const displayUploadStatus = ( ) => {
    if ( !observation.id ) {
      return (
        <UploadStatus
          progress={uploadProgress?.[observation.uuid] || 0}
          startSingleUpload={( ) => {
            if ( !currentUser ) {
              setShowLoginSheet( true );
              return;
            }
            startSingleUpload( observation );
          }}
          color={whiteColor}
          completeColor={whiteColor}
        >
          <UploadCompleteAnimation
            wasSynced={wasSynced}
            observation={observation}
            layout={layout}
            white={white}
          />
        </UploadStatus>
      );
    }
    return (
      <ObsStatus
        observation={observation}
        layout={layout}
        white={white}
        classNameMargin={classNameMargin}
      />
    );
  };

  return displayUploadStatus( );
};

export default ObsUploadStatus;
