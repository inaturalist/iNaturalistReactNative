// @flow

import BottomSheet from "components/SharedComponents/BottomSheet";
import type { Node } from "react";
import React from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useUploadStatus from "sharedHooks/useUploadStatus";

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
  const { uploadInProgress, updateUploadStatus } = useUploadStatus( );

  if ( numOfUnuploadedObs === 0 ) {
    return null;
  }

  if ( !currentUser ) {
    return (
      <BottomSheet hide={hasScrolled}>
        <LoginPrompt />
      </BottomSheet>
    );
  }
  // FYI, this actually controls uploading, because the UploadProgressBar
  // calls useUploadObservations which immediately tries to upload, so just
  // rendering UploadProgressBar kicks off the upload
  if ( uploadInProgress ) {
    return (
      <UploadProgressBar
        unuploadedObsList={unuploadedObsList}
        allObsToUpload={allObsToUpload}
      />
    );
  }
  if ( numOfUnuploadedObs > 0 && currentUser ) {
    return (
      <BottomSheet hide={hasScrolled}>
        <UploadPrompt
          uploadObservations={updateUploadStatus}
          numOfUnuploadedObs={numOfUnuploadedObs}
          updateUploadStatus={updateUploadStatus}
        />
      </BottomSheet>
    );
  }
  return null;
};

export default ObsListBottomSheet;
