import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import ObsPressable from "components/ObservationsFlashList/ObsPressable";
import { RealmContext } from "providers/contexts";
import React from "react";
import { Alert } from "react-native";
import type { RealmObservation } from "realmModels/types";
import type { UserPojo } from "realmModels/User";
import { useLayoutPrefs, useNavigateToObsEdit, useTranslation } from "sharedHooks";
import { UPLOAD_PENDING } from "stores/createUploadObservationsSlice";
import useStore from "stores/useStore";

const { useObject } = RealmContext;

interface Props {
  currentUser: UserPojo | null;
  height: number;
  uuid: string;
  width: number;
}

// The connected wrapper for one small grid tile: it owns the per-observation state and the
// press handlers, and hands them to ObsPressable, which hydrates from Realm and renders the
// presentational SmallGridObsItem.
// This subscribes to the upload store itself, with selectors narrow enough to return
// primitives, so an upload progress tick re-renders only the cell that's actually uploading.

const SmallGridObsItemContainer = ( {
  currentUser,
  height,
  uuid,
  width,
}: Props ) => {
  const { t } = useTranslation( );
  const { isDefaultMode } = useLayoutPrefs( );
  const { isConnected } = useNetInfo( );
  const navigation = useNavigation( );
  const navigateToObsEdit = useNavigateToObsEdit( );

  const queued = useStore( state => state.uploadQueue.includes( uuid ) );
  const activeProgress = useStore(
    state => state.totalUploadProgress.find( o => o.uuid === uuid )?.totalProgress,
  );
  // Actions are stable references, so selecting them doesn't cause re-renders
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const addTotalToolbarIncrements = useStore( state => state.addTotalToolbarIncrements );
  const setStartUploadObservations = useStore( state => state.setStartUploadObservations );

  const observation = useObject<RealmObservation>( "Observation", uuid );
  // Not the needs_sync column, which is only written when an observation is created and in
  // the schema 55 migration, so it can be stale
  const obsNeedsSync = observation?.needsSync( ) ?? false;

  // undefined means "not currently uploading", which is how ObsUploadStatus decides whether
  // to render an upload icon at all, so only coalesce to 0 for observations that need syncing
  const uploadProgress = obsNeedsSync
    ? activeProgress ?? 0
    : activeProgress;

  const onItemPress = ( ) => {
    if ( obsNeedsSync && !isDefaultMode && observation ) {
      navigateToObsEdit( observation );
      return;
    }
    navigation.navigate( {
      key: `Obs-MyObservationsSmallGrid-${uuid}`,
      name: "ObsDetails",
      params: { uuid },
    } );
  };

  const onUploadButtonPress = ( ) => {
    if ( queued || !observation ) return;
    if ( isDefaultMode && observation.missingBasics( ) ) {
      navigateToObsEdit( observation );
      return;
    }
    if ( !isConnected ) {
      Alert.alert(
        t( "Internet-Connection-Required" ),
        t( "Please-try-again-when-you-are-connected-to-the-internet" ),
      );
      return;
    }
    addTotalToolbarIncrements( observation );
    addToUploadQueue( uuid );
    // Read at press time rather than subscribing, so a change in upload status doesn't
    // re-render every mounted cell
    if ( useStore.getState( ).uploadStatus === UPLOAD_PENDING ) {
      setStartUploadObservations( );
    }
  };

  return (
    <ObsPressable
      currentUser={currentUser}
      explore={false}
      height={height}
      layout="smallGrid"
      onItemPress={onItemPress}
      onUploadButtonPress={onUploadButtonPress}
      queued={queued}
      unsynced={obsNeedsSync}
      uploadProgress={uploadProgress}
      uuid={uuid}
      width={width}
    />
  );
};

export default React.memo( SmallGridObsItemContainer );
