// @flow

import { useRoute } from "@react-navigation/native";
import type { Node } from "react";
import React, { useEffect } from "react";

import BottomSheet from "../SharedComponents/BottomSheet";
import ObservationViews from "../SharedComponents/ObservationViews/ObservationViews";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useUser from "../UserProfile/hooks/useUser";
import useCurrentUser from "./hooks/useCurrentUser";
import useObservations from "./hooks/useObservations";
import LoggedOutCard from "./LoggedOutCard";
import LoginPrompt from "./LoginPrompt";
import UploadProgressBar from "./UploadProgressBar";
import UploadPrompt from "./UploadPrompt";
import UserCard from "./UserCard";

const ObsList = ( ): Node => {
  const { params } = useRoute( );
  const {
    observationList,
    loading,
    syncObservations,
    fetchNextObservations,
    uploadStatus,
    updateUploadStatus
  } = useObservations( );
  const { unuploadedObs, uploadInProgress } = uploadStatus;

  const id = ( params && params.userId ) || null;
  const userId = useCurrentUser( ) || id;
  const { user } = useUser( userId );
  const numObsToUpload = unuploadedObs?.length;

  useEffect( ( ) => {
    // start fetching data immediately after successful login
    if ( params && params.syncData && params.userLogin ) {
      syncObservations( params.userLogin );
    } else if ( params && params.savedLocalData ) {
      // from obsEdit screen
      syncObservations( );
    }
  }, [params, syncObservations] );

  const renderBottomSheet = ( ) => {
    if ( numObsToUpload === 0 ) { return null; }

    // show after useCurrentUser has tried to fetch current user
    if ( userId === null && !loading ) {
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
      {
        user
          ? <UserCard userId={userId} user={user} />
          : <LoggedOutCard numObsToUpload={numObsToUpload} />
      }
      <ObservationViews
        loading={loading}
        observationList={observationList}
        testID="ObsList.myObservations"
        handleEndReached={fetchNextObservations}
        syncObservations={syncObservations}
        userId={userId}
      />
      {renderBottomSheet( )}
    </ViewWithFooter>
  );
};

export default ObsList;
