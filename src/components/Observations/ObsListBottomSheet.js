// @flow

import BottomSheet from "components/SharedComponents/BottomSheet";
import type { Node } from "react";
import React from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useUploadObservations from "sharedHooks/useUploadObservations";

import LoginPrompt from "./LoginPrompt";
import UploadProgressBar from "./UploadProgressBar";
import UploadPrompt from "./UploadPrompt";

type Props = {
  hasScrolled: boolean
}

const ObsListBottomSheet = ( { hasScrolled }: Props ): Node => {
  const currentUser = useCurrentUser( );
  const { unuploadedObsList, allObsToUpload } = useLocalObservations( );
  const numOfUnuploadedObs = unuploadedObsList?.length;
  const {
    handleClosePress,
    uploadInProgress,
    startUpload
  } = useUploadObservations( allObsToUpload );

  if ( !currentUser ) {
    return (
      <BottomSheet hide={hasScrolled}>
        <LoginPrompt />
      </BottomSheet>
    );
  }

  if ( uploadInProgress ) {
    return (
      <UploadProgressBar
        handleClosePress={handleClosePress}
        unuploadedObsList={unuploadedObsList}
        allObsToUpload={allObsToUpload}
      />
    );
  }
  if ( numOfUnuploadedObs > 0 && currentUser ) {
    return (
      <BottomSheet hide={hasScrolled}>
        <UploadPrompt
          uploadObservations={startUpload}
          numOfUnuploadedObs={numOfUnuploadedObs}
        />
      </BottomSheet>
    );
  }
  return null;
};

export default ObsListBottomSheet;
