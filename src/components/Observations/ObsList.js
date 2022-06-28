// @flow

import React, { useEffect } from "react";
import type { Node } from "react";
import { useRoute } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import ObservationViews from "../SharedComponents/ObservationViews/ObservationViews";
import UserCard from "./UserCard";
import { useCurrentUser } from "./hooks/useCurrentUser";
import BottomSheet from "../SharedComponents/BottomSheet";
import useObservations from "./hooks/useObservations";
import LoggedOutCard from "./LoggedOutCard";
import { useUser } from "../UserProfile/hooks/useUser";
import LoginPrompt from "./LoginPrompt";
import UploadPrompt from "./UploadPrompt";

const ObsList = ( ): Node => {
  const { params } = useRoute( );
  const { observationList, loading, syncObservations, fetchNextObservations, obsToUpload } = useObservations( );

  const id = params && params.userId;
  const userId = useCurrentUser( ) || id;
  const { user } = useUser( userId );
  const numObsToUpload = obsToUpload?.length;

  useEffect( ( ) => {
    // start fetching data immediately after successful login
    if ( params && params.syncData && params.userLogin ) {
      syncObservations( params.userLogin );
    } else if ( params && params.savedLocalData ) {
      // from obsEdit screen
      syncObservations( );
    }
  }, [params, syncObservations] );

  return (
    <ViewWithFooter>
      {user ? <UserCard userId={userId} user={user} /> : <LoggedOutCard numObsToUpload={numObsToUpload} />}
      <ObservationViews
        loading={loading}
        observationList={observationList}
        testID="ObsList.myObservations"
        handleEndReached={fetchNextObservations}
        syncObservations={syncObservations}
        userId={userId}
      />
      {( numObsToUpload > 0 ) && (
        <BottomSheet height={200}>
          {!userId
            ? <LoginPrompt />
            : <UploadPrompt obsToUpload={obsToUpload} />
          }
        </BottomSheet>
      )}
    </ViewWithFooter>
  );
};

export default ObsList;
