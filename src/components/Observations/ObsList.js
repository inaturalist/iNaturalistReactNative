// @flow

import type { Node } from "react";
import React from "react";

import useLoggedIn from "../../sharedHooks/useLoggedIn";
import BottomSheet from "../SharedComponents/BottomSheet";
import ObservationViews from "../SharedComponents/ObservationViews/ObservationViews";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useRemoteObservations from "./hooks/useRemoteObservations";
import useSubscribeToLocalObservations from "./hooks/useSubscribeToLocalObservations";
import useUploadStatus from "./hooks/useUploadStatus";
import LoginPrompt from "./LoginPrompt";
import TopCard from "./TopCard";
import UploadProgressBar from "./UploadProgressBar";
import UploadPrompt from "./UploadPrompt";

const ObsList = ( ): Node => {
  const { observationList, unuploadedObsList } = useSubscribeToLocalObservations( );
  const {
    loading,
    syncObservations,
    fetchNextObservations
  } = useRemoteObservations( );
  const { uploadStatus, updateUploadStatus } = useUploadStatus( );
  const { uploadInProgress } = uploadStatus;
  const numObsToUpload = unuploadedObsList?.length;

  console.log( uploadStatus, "upload status, ObsList" );

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
          unuploadedObsList={unuploadedObsList}
        />
      );
    }
    return (
      <BottomSheet>
        <UploadPrompt
          uploadObservations={updateUploadStatus}
          numObsToUpload={numObsToUpload}
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
