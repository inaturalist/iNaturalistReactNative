import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import ObsPressable from "components/ObservationsFlashList/ObsPressable";
import { SmallGrid } from "components/SharedComponents";
import { RealmContext } from "providers/contexts";
import React from "react";
import { Alert } from "react-native";
import type { RealmObservation } from "realmModels/types";
import getObservationUploadStatus from "sharedHelpers/observationUploadStatus";
import {
  useCurrentUser, useLayoutPrefs, useNavigateToObsEdit, useTranslation,
} from "sharedHooks";
import useLocalObservationIds from "sharedHooks/useLocalObservationIds";
import { UPLOAD_PENDING } from "stores/createUploadObservationsSlice";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

const MyObservationsGroupedByIconicTaxaView = ( ) => {
  const { t } = useTranslation( );
  const localObservationIds = useLocalObservationIds( );
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );
  const realm = useRealm( );
  const { isDefaultMode } = useLayoutPrefs( );
  const navigateToObsEdit = useNavigateToObsEdit( );
  const { isConnected } = useNetInfo( );
  const uploadQueue = useStore( state => state.uploadQueue );
  const totalUploadProgress = useStore( state => state.totalUploadProgress );
  const uploadStatus = useStore( state => state.uploadStatus );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const addTotalToolbarIncrements = useStore( state => state.addTotalToolbarIncrements );
  const setStartUploadObservations = useStore( state => state.setStartUploadObservations );

  if ( !currentUser ) return null;

  return (
    <SmallGrid
      data={localObservationIds}
      keyExtractor={item => item.uuid}
      renderTile={( item, width, height ) => {
        const { uuid } = item;
        const { obsNeedsSync, queued, uploadProgress } = getObservationUploadStatus(
          realm,
          uploadQueue,
          totalUploadProgress,
          uuid,
        );

        const onItemPress = ( ) => {
          if ( obsNeedsSync && !isDefaultMode ) {
            const realmObservation = realm.objectForPrimaryKey<RealmObservation>(
              "Observation",
              uuid,
            );
            if ( realmObservation ) {
              navigateToObsEdit( realmObservation );
              return;
            }
          }
          navigation.navigate( {
            key: `Obs-MyObservationsSmallGrid-${uuid}`,
            name: "ObsDetails",
            params: { uuid },
          } );
        };

        const onUploadButtonPress = ( ) => {
          if ( uploadQueue.includes( uuid ) ) return;
          const observation = realm.objectForPrimaryKey<RealmObservation>( "Observation", uuid );
          if ( !observation ) return;
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
          if ( uploadStatus === UPLOAD_PENDING ) {
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
      }}
      testID="MyObservationsGroupedByIconicTaxaView"
    />
  );
};

export default MyObservationsGroupedByIconicTaxaView;
