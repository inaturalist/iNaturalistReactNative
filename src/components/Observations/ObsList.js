// @flow

import type { Node } from "react";
import React from "react";

import useLoggedIn from "../../sharedHooks/useLoggedIn";
import BottomSheet from "../SharedComponents/BottomSheet";
import ObservationViews from "../SharedComponents/ObservationViews/ObservationViews";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useRemoteObservations from "./hooks/useRemoteObservations";
import useSubscribeToLocalObservations from "./hooks/useSubscribeToLocalObservations";
import LoginPrompt from "./LoginPrompt";
import TopCard from "./TopCard";
import UploadProgressBar from "./UploadProgressBar";
import UploadPrompt from "./UploadPrompt";

const ObsList = ( ): Node => {
  const observationList = useSubscribeToLocalObservations( );
  const {
    loading,
    syncObservations,
    fetchNextObservations,
    uploadStatus,
    updateUploadStatus
  } = useRemoteObservations( );
  const { unuploadedObs, uploadInProgress } = uploadStatus;
  const numObsToUpload = unuploadedObs?.length;

  const isLoggedIn = useLoggedIn( );

  const renderBottomSheet = ( ) => {
    if ( numObsToUpload === 0 ) { return null; }

    if ( isLoggedIn === false && !loading ) {
      return (
        <BottomSheet>
          <LoginPrompt />
        </BottomSheet>
      );
    }
    if ( uploadInProgress ) {
      return (
        <UploadProgressBar
          uploadStatus={uploadStatus}
        />
      );
    }
    return (
      <BottomSheet>
        <UploadPrompt
          uploadObservations={updateUploadStatus}
          uploadStatus={uploadStatus}
          updateUploadStatus={updateUploadStatus}
        />
      </BottomSheet>
    );
  };

  return (
    <ViewWithFooter>
      <TopCard numObsToUpload={numObsToUpload} />
      <ObservationViews
        loading={loading}
        observationList={observationList}
        testID="ObsList.myObservations"
        handleEndReached={( ) => fetchNextObservations( observationList.length )}
        syncObservations={syncObservations}
      />
      {renderBottomSheet( )}
    </ViewWithFooter>
  );
};

export default ObsList;
