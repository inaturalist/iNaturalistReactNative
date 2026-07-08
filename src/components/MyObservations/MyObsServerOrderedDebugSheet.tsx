/* eslint-disable i18next/no-literal-string */
import classnames from "classnames";
import useServerOrderedObservations
  from "components/MyObservations/hooks/useServerOrderedObservations";
import { INatIconButton } from "components/SharedComponents";
import Modal from "components/SharedComponents/Modal";
import Body3 from "components/SharedComponents/Typography/Body3";
import Heading4 from "components/SharedComponents/Typography/Heading4";
import {
  Image, Pressable, ScrollView, Text, View,
} from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React, { useState } from "react";
import type { RealmObservation } from "realmModels/types";
import { OBSERVATIONS_SORT, OBSERVATIONS_SORT_OPTIONS } from "sharedHelpers/observationsSort";
import useDebugMode from "sharedHooks/useDebugMode";

const { useObject } = RealmContext;

const SORT_LABELS: Record<OBSERVATIONS_SORT, string> = {
  [OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST]: "Uploaded ↓",
  [OBSERVATIONS_SORT.DATE_UPLOADED_OLDEST]: "Uploaded ↑",
  [OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST]: "Observed ↓",
  [OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST]: "Observed ↑",
};

const SCROLL_CONTENT = { paddingBottom: 32 };

interface DebugButtonProps {
  label: string;
  onPress: ( ) => void;
  active?: boolean;
}

const DebugButton = ( { label, onPress, active }: DebugButtonProps ) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    className={`px-3 py-2 mr-2 mb-2 rounded ${
      active
        ? "bg-inatGreen"
        : "bg-darkGray"
    }`}
  >
    <Text className="text-white text-xs">{label}</Text>
  </Pressable>
);

interface DebugRealmObservation extends RealmObservation {
  id?: number;
}

interface ObservationRowProps {
  uuid: string;
  index: number;
}

const ObservationRow = ( { uuid, index }: ObservationRowProps ) => {
  const observation = useObject<DebugRealmObservation>( "Observation", uuid );
  const thumbnailUrl = observation?.observationPhotos?.[0]?.photo?.url;
  const name = observation?.taxon?.preferredCommonName
    || observation?.taxon?.name
    || "(no taxon)";
  const uploadedAt = observation?._created_at
    ? observation._created_at.toLocaleDateString( )
    : "—";
  const observedOn = observation?.observed_on
    ? new Date( observation.observed_on ).toLocaleDateString( )
    : "—";

  return (
    <View className="flex-row items-center mb-3 pb-3 border-b border-lightGray">
      <Text className="w-6 text-xs">{index + 1}</Text>
      {thumbnailUrl
        ? <Image source={{ uri: thumbnailUrl }} className="w-12 h-12 rounded mr-2" />
        : <View className="w-12 h-12 rounded mr-2 bg-lightGray" />}
      <View className="flex-1">
        <Text numberOfLines={1} className="font-bold">{name}</Text>
        <Text className="text-xs text-darkGray">
          {`id: ${observation?.id ?? "—"} · uuid: ${uuid}`}
        </Text>
        <Text className="text-xs text-darkGray">{`uploaded: ${uploadedAt}`}</Text>
        <Text className="text-xs text-darkGray">{`observed: ${observedOn}`}</Text>
      </View>
    </View>
  );
};

const MyObsServerOrderedDebugSheet = ( ) => {
  const { isDebug } = useDebugMode( );
  const [visible, setVisible] = useState( false );
  const [selectedSort, setSelectedSort] = useState<OBSERVATIONS_SORT>(
    OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
  );

  const {
    observationIds,
    isLoading,
    error,
    totalResults,
    refetch,
  } = useServerOrderedObservations( {
    sortBy: selectedSort,
    enabled: visible,
  } );

  if ( !isDebug ) return null;

  const onClose = ( ) => setVisible( false );

  return (
    <>
      <INatIconButton
        icon="triangle-exclamation"
        className="absolute top-64 right-5 rounded-full bg-deepPink"
        color="white"
        size={27}
        accessibilityLabel="MyObs server order diagnostics"
        onPress={( ) => setVisible( true )}
      />
      <Modal
        showModal={visible}
        closeModal={onClose}
        disableSwipeDirection
        modal={(
          <View className="bg-white rounded-t-2xl h-[85%]">
            <View
              className={classnames(
                "px-4 pt-4 pb-2 flex-row items-center justify-between",
                "border-b border-lightGray",
              )}
            >
              <Heading4>MyObs Server Order Debug</Heading4>
              <Pressable accessibilityRole="button" onPress={onClose}>
                <Text className="text-base text-inatGreen">Close</Text>
              </Pressable>
            </View>
            <ScrollView
              className="flex-1 px-4 py-3"
              contentContainerStyle={SCROLL_CONTENT}
            >
              <View className="flex-row flex-wrap mb-3">
                {OBSERVATIONS_SORT_OPTIONS.map( sort => (
                  <DebugButton
                    key={sort}
                    label={SORT_LABELS[sort]}
                    active={selectedSort === sort}
                    onPress={( ) => setSelectedSort( sort )}
                  />
                ) )}
                <DebugButton label="Refresh" onPress={( ) => refetch( )} />
              </View>
              {isLoading && <Body3 className="mb-2">Loading…</Body3>}
              {!!error && <Body3 className="mb-2">{`Error: ${error.message}`}</Body3>}
              <Body3 className="mb-3">{`Total results: ${totalResults ?? "n/a"}`}</Body3>
              {observationIds.map( ( { uuid }, index ) => (
                <ObservationRow key={uuid} uuid={uuid} index={index} />
              ) )}
            </ScrollView>
          </View>
        )}
      />
    </>
  );
};

export default MyObsServerOrderedDebugSheet;
