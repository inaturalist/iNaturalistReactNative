// @flow

import createIdentifications from "api/identifications";
import Button from "components/SharedComponents/Buttons/Button";
import type { Node } from "react";
import React, { useState } from "react";
import {
  ActivityIndicator, Image, Pressable, Text, View
} from "react-native";
import Observation from "realmModels/Observation";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import {
  imageStyles,
  textStyles,
  viewStyles
} from "styles/observations/gridItem";

type Props = {
  item: Object,
  handlePress: Function,
  reviewedIds: Array<number>,
  setReviewedIds: Function
}

const GridItem = ( {
  item, handlePress, reviewedIds, setReviewedIds
}: Props ): Node => {
  const [showLoadingWheel, setShowLoadingWheel] = useState( false );
  const commonName = item.taxon && item.taxon.preferred_common_name;
  const name = item.taxon ? item.taxon.name : "unknown";
  const isSpecies = item.taxon && item.taxon.rank === "species";
  const wasReviewed = reviewedIds.includes( item.id );
  const onPress = ( ) => handlePress( item );
  // TODO: fix whatever funkiness is preventing realm mapTo from correctly
  // displaying camelcased item keys on ObservationList

  // TODO: add fallback image when there is no uri
  const imageUri = Observation.projectUri( item );

  const handleSuccess = {
    onSuccess: ( ) => {
      const ids = Array.from( reviewedIds );
      ids.push( item.id );
      setReviewedIds( ids );
    }
  };

  const createIdentificationMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => createIdentifications( params, optsWithAuth ),
    handleSuccess
  );

  const agreeWithObservation = async ( ) => {
    setShowLoadingWheel( true );
    createIdentificationMutation.mutate( {
      identification: {
        observation_id: item.uuid,
        taxon_id: item.taxon.id
      }
    } );
    setShowLoadingWheel( false );
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        viewStyles.gridItem,
        wasReviewed && viewStyles.markReviewed
      ]}
      testID={`ObsList.gridItem.${item.uuid}`}
      accessibilityRole="link"
      accessibilityLabel="Navigate to observation details screen"
    >
      <Image
        source={imageUri}
        style={imageStyles.gridImage}
        testID="ObsList.photo"
      />
      <Image
        source={{ uri: item?.user?.icon_url }}
        style={imageStyles.userImage}
        testID="ObsList.identifierPhoto"
      />
      {showLoadingWheel && <ActivityIndicator />}
      <View style={viewStyles.taxonName}>
        <View style={viewStyles.textBox}>
          {commonName && <Text style={textStyles.text}>{commonName}</Text>}
          <Text style={textStyles.text}>{name}</Text>
        </View>
        {isSpecies && (
          <Button
            level="primary"
            onPress={agreeWithObservation}
            text="agree"
            testID="Identify.agree"
            disabled={wasReviewed}
          />
        )}
      </View>
    </Pressable>
  );
};

export default GridItem;
