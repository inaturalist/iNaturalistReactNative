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
  uploadStatus: Object,
  layout?: "horizontal" | "vertical",
  white?: boolean,
  classNameMargin?: string
};

const ObsUploadStatus = ( {
  observation,
  uploadStatus,
  layout,
  white,
  classNameMargin
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const theme = useTheme( );
  const obsEditContext = useContext( ObsEditContext );
  const startSingleUpload = obsEditContext?.startSingleUpload;
  const uploadProgress = obsEditContext?.uploadProgress;
  const wasSynced = observation.wasSynced( );
  const { allObsToUpload } = uploadStatus;

  console.log( uploadProgress, "upload progress" );

  const displayUploadStatus = ( ) => {
    if ( allObsToUpload.find( upload => upload.uuid === observation.uuid ) ) {
      return (
        <UploadStatus
          progress={uploadProgress[observation.uuid] || 0}
          startSingleUpload={( ) => startSingleUpload( observation )}
          color={theme.colors.onPrimary}
          completeColor={theme.colors.onPrimary}
          buttonDisabled={!currentUser}
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
