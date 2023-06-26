// @flow

import { UploadStatus } from "components/SharedComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { Alert } from "react-native";
import { useTheme } from "react-native-paper";
import {
  useCurrentUser,
  useIsConnected,
  useTranslation
} from "sharedHooks";

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
  const uploadObservation = obsEditContext?.uploadObservation;
  const uploadProgress = obsEditContext?.uploadProgress;
  const whiteColor = white && theme.colors.onPrimary;
  const isConnected = useIsConnected( );
  const { t } = useTranslation( );

  const needsSync = item => !item._synced_at
    || item._synced_at <= item._updated_at;

  const totalProgressIncrements = needsSync( observation )
    + observation
      .observationPhotos.map( obsPhoto => needsSync( obsPhoto ) ).length;
  const currentProgress = uploadProgress?.[observation.uuid];

  const displayUploadStatus = ( ) => {
    const obsStatus = (
      <ObsStatus
        observation={observation}
        layout={layout}
        white={white}
        classNameMargin={classNameMargin}
      />
    );

    if ( !observation.id || typeof currentProgress === "number" ) {
      const progress = currentProgress / totalProgressIncrements;
      return (
        <UploadStatus
          progress={progress || 0}
          uploadObservation={() => {
            if ( !isConnected ) {
              Alert.alert(
                t( "Internet-Connection-Required" ),
                t( "Please-try-again-when-you-are-connected-to-the-internet" )
              );
              return;
            }

            if ( !currentUser ) {
              setShowLoginSheet( true );
              return;
            }
            uploadObservation( observation, true );
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
