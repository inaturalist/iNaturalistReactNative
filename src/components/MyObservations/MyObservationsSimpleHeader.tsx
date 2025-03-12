import AddObsButton from "components/AddObsModal/AddObsButton.tsx";
import {
  HeaderUser,
  Heading3,
  RotatingINatIconButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import type {
  RealmUser
} from "realmModels/types";
import { useTranslation } from "sharedHooks";
import {
  MANUAL_SYNC_IN_PROGRESS
} from "stores/createSyncObservationsSlice.ts";
import {
  UPLOAD_COMPLETE,
  UPLOAD_IN_PROGRESS,
  UPLOAD_PENDING
} from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

import SimpleUploadBannerContainer from "./SimpleUploadBannerContainer";

export interface Props {
  currentUser?: RealmUser;
  handleSyncButtonPress: ( ) => void;
  isConnected: boolean;
}

const MyObservationsSimpleHeader = ( {
  currentUser,
  handleSyncButtonPress,
  isConnected
}: Props ) => {
  const { t } = useTranslation( );

  // TODO: all the code related to showing the sync button is pretty convoluted and'
  // should be cleaned up at some point, but right now it's ported from our ToolbarContainer/Toolbar
  // code from the Soft Launch version of the app 20250218
  const currentDeleteCount = useStore( state => state.currentDeleteCount );
  const uploadErrorsByUuid = useStore( state => state.errorsByUuid );
  const initialNumObservationsInQueue = useStore( state => state.initialNumObservationsInQueue );
  const numUnuploadedObservations = useStore( state => state.numUnuploadedObservations );
  const uploadStatus = useStore( state => state.uploadStatus );
  const syncingStatus = useStore( state => state.syncingStatus );
  const initialNumDeletionsInQueue = useStore( state => state.initialNumDeletionsInQueue );
  const numUploadsAttempted = useStore( state => state.numUploadsAttempted );

  const deletionsComplete = initialNumDeletionsInQueue === currentDeleteCount;
  const deletionsInProgress = initialNumDeletionsInQueue > 0 && !deletionsComplete;

  const manualSyncInProgress = syncingStatus === MANUAL_SYNC_IN_PROGRESS;
  const pendingUpload = uploadStatus === UPLOAD_PENDING && numUnuploadedObservations > 0;
  const uploadInProgress = uploadStatus === UPLOAD_IN_PROGRESS && numUploadsAttempted > 0;
  const uploadsComplete = uploadStatus === UPLOAD_COMPLETE && initialNumObservationsInQueue > 0;
  const totalUploadErrors = Object.keys( uploadErrorsByUuid ).length;

  const showFinalUploadError = ( totalUploadErrors > 0 && uploadsComplete )
  || ( totalUploadErrors > 0 && ( numUploadsAttempted === initialNumObservationsInQueue ) );

  const rotating = manualSyncInProgress || uploadInProgress || deletionsInProgress;

  let showsExclamation = pendingUpload || showFinalUploadError;

  // The exclamation mark should *never* appear while rotating, no matter what
  // the props say
  if ( rotating ) showsExclamation = false;

  return (
    <>
      <SimpleUploadBannerContainer
        handleSyncButtonPress={handleSyncButtonPress}
        numUnuploadedObservations={numUnuploadedObservations}
      />
      <View className="flex-row justify-between items-center px-5 py-1">
        {currentUser
          ? <HeaderUser user={currentUser} isConnected={isConnected} />
          : <Heading3>{ t( "My-Observations" ) }</Heading3>}
        {currentUser && (
          <RotatingINatIconButton
            icon={
              showsExclamation
                ? "sync-unsynced"
                : "sync"
            }
            onPress={handleSyncButtonPress}
            color={String(
              numUnuploadedObservations > 0
                ? colors?.inatGreen
                : colors?.darkGray
            )}
            rotating={rotating}
            disabled={rotating}
            accessibilityLabel={t( "Sync-observations" )}
            size={26}
            testID="SyncButton"
          />
        )}
        <AddObsButton plusOnly />
      </View>
    </>
  );
};

export default MyObservationsSimpleHeader;
