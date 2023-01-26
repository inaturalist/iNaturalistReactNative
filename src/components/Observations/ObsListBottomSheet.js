// @flow

import BottomSheet from "components/SharedComponents/BottomSheet";
import type { Node } from "react";
import React from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useNumUnuploadedObservations from "sharedHooks/useNumUnuploadedObservations";
import useUploadObservations from "sharedHooks/useUploadObservations";

import LoginPrompt from "./LoginPrompt";
import UploadProgressBar from "./UploadProgressBar";
import UploadPrompt from "./UploadPrompt";

type Props = {
  hasScrolled: boolean
}

const ObsListBottomSheet = ( { hasScrolled }: Props ): Node => {
  const currentUser = useCurrentUser( );
  const { allObsToUpload } = useLocalObservations( );
  const numUnuploadedObs = useNumUnuploadedObservations( );

  const {
    stopUpload,
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
        stopUpload={stopUpload}
        allObsToUpload={allObsToUpload}
      />
    );
  }
  if ( numUnuploadedObs > 0 && currentUser ) {
    return (
      <BottomSheet hide={hasScrolled}>
        <UploadPrompt startUpload={startUpload} />
      </BottomSheet>
    );
  }
  return null;
};

export default ObsListBottomSheet;
