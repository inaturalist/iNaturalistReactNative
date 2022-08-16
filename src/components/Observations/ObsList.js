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
  const { observationList, unuploadedObsList, allObsToUpload } = useSubscribeToLocalObservations( );
  const {
    loading,
    syncObservations,
    fetchNextObservations
  } = useRemoteObservations( );
  const { uploadInProgress, updateUploadStatus } = useUploadStatus( );
  const numOfUnuploadedObs = unuploadedObsList?.length;

  const isLoggedIn = useLoggedIn( );

  const renderBottomSheet = ( ) => {
    if ( numOfUnuploadedObs === 0 ) { return null; }

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
          unuploadedObsList={unuploadedObsList}
          allObsToUpload={allObsToUpload}
        />
      );
    }
    return (
      <BottomSheet>
        <UploadPrompt
          uploadObservations={updateUploadStatus}
          numOfUnuploadedObs={numOfUnuploadedObs}
          updateUploadStatus={updateUploadStatus}
        />
      </BottomSheet>
    );
  };

  return (
    <ViewWithFooter>
      <TopCard numOfUnuploadedObs={numOfUnuploadedObs} />
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
