import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import ObsPressable from "components/ObservationsFlashList/ObsPressable";
import { CollapsibleSectionHeader, SmallGrid } from "components/SharedComponents";
import { ScrollView, View } from "components/styledComponents";
import type { TFunction } from "i18next";
import { RealmContext } from "providers/contexts";
import React, { useMemo, useState } from "react";
import { Alert } from "react-native";
import type { RealmObservation } from "realmModels/types";
import { ICONIC_TAXA_GROUP, ICONIC_TAXA_GROUP_ORDER } from "sharedHelpers/iconicTaxaGroupOrder";
import getObservationUploadStatus from "sharedHelpers/observationUploadStatus";
import {
  useCurrentUser, useLayoutPrefs, useNavigateToObsEdit, useTranslation,
} from "sharedHooks";
import useLocalObservationIds from "sharedHooks/useLocalObservationIds";
import { UPLOAD_PENDING } from "stores/createUploadObservationsSlice";
import useStore from "stores/useStore";

import useIconicTaxaObservationCounts from "./hooks/useIconicTaxaObservationCounts";

const { useRealm } = RealmContext;

function iconForCategory( category: ICONIC_TAXA_GROUP ) {
  return category === ICONIC_TAXA_GROUP.OTHER
    ? "iconic-unknown"
    : `iconic-${category}`;
}

function iconicTaxaGroupTitles( t: TFunction ): Record<ICONIC_TAXA_GROUP, string> {
  return {
    [ICONIC_TAXA_GROUP.ACTINOPTERYGII]: t( "Fish" ),
    [ICONIC_TAXA_GROUP.AMPHIBIA]: t( "Amphibians" ),
    [ICONIC_TAXA_GROUP.ANIMALIA]: t( "Other-Animals" ),
    [ICONIC_TAXA_GROUP.ARACHNIDA]: t( "Arachnids" ),
    [ICONIC_TAXA_GROUP.AVES]: t( "Birds" ),
    [ICONIC_TAXA_GROUP.CHROMISTA]: t( "Kelp-and-Diatoms" ),
    [ICONIC_TAXA_GROUP.FUNGI]: t( "Fungi" ),
    [ICONIC_TAXA_GROUP.INSECTA]: t( "Insects" ),
    [ICONIC_TAXA_GROUP.MAMMALIA]: t( "Mammals" ),
    [ICONIC_TAXA_GROUP.MOLLUSCA]: t( "Mollusks" ),
    [ICONIC_TAXA_GROUP.PLANTAE]: t( "Plants" ),
    [ICONIC_TAXA_GROUP.PROTOZOA]: t( "Protozoans" ),
    [ICONIC_TAXA_GROUP.REPTILIA]: t( "Reptiles" ),
    [ICONIC_TAXA_GROUP.OTHER]: t( "Other" ),
  };
}

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
  const iconicTaxaCounts = useIconicTaxaObservationCounts( );
  const titlesByCategory = iconicTaxaGroupTitles( t );

  // Temporary testing set up which just distributes the list of local obs across every
  // category so get can mock up multiple sections.
  const sections = useMemo( ( ) => {
    const buckets = new Map<ICONIC_TAXA_GROUP, typeof localObservationIds>(
      ICONIC_TAXA_GROUP_ORDER.map( category => [category, []] ),
    );
    localObservationIds.forEach( ( item, index ) => {
      const category = ICONIC_TAXA_GROUP_ORDER[index % ICONIC_TAXA_GROUP_ORDER.length];
      buckets.get( category )?.push( item );
    } );
    return ICONIC_TAXA_GROUP_ORDER
      .map( category => ( {
        category,
        count: iconicTaxaCounts.find( c => c.category === category )?.count ?? 0,
        observations: buckets.get( category ) ?? [],
      } ) )
      .filter( section => section.observations.length > 0 );
  }, [localObservationIds, iconicTaxaCounts] );

  const [openCategories, setOpenCategories] = useState<Set<ICONIC_TAXA_GROUP>>(
    ( ) => new Set( ICONIC_TAXA_GROUP_ORDER ),
  );

  if ( !currentUser ) return null;

  const toggleCategory = ( category: ICONIC_TAXA_GROUP ) => {
    setOpenCategories( prev => {
      const next = new Set( prev );
      if ( next.has( category ) ) {
        next.delete( category );
      } else {
        next.add( category );
      }
      return next;
    } );
  };

  return (
    <ScrollView testID="MyObservationsGroupedByIconicTaxaView">
      {sections.map( ( { category, count, observations } ) => (
        <View key={category}>
          <CollapsibleSectionHeader
            count={count}
            icon={iconForCategory( category )}
            isOpen={openCategories.has( category )}
            onToggle={( ) => toggleCategory( category )}
            testID={`MyObservationsGroupedByIconicTaxaView.Header.${category}`}
            title={titlesByCategory[category]}
          />
          {openCategories.has( category ) && (
            <SmallGrid
              data={observations}
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
                  const observation = realm.objectForPrimaryKey<RealmObservation>(
                    "Observation",
                    uuid,
                  );
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
              testID={`MyObservationsGroupedByIconicTaxaView.Grid.${category}`}
            />
          )}
        </View>
      ) )}
    </ScrollView>
  );
};

export default MyObservationsGroupedByIconicTaxaView;
