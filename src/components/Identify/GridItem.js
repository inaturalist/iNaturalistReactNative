// @flow

import createIdentification from "api/identifications";
import Button from "components/SharedComponents/Buttons/Button";
import { t } from "i18next";
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
  reviewedIds: Array<number>,
  setReviewedIds: Function
}

const GridItem = ( {
  item, reviewedIds, setReviewedIds
}: Props ): Node => {
  const [showLoadingWheel, setShowLoadingWheel] = useState( false );
  const commonName = item.taxon && item.taxon.preferred_common_name;
  const name = item.taxon ? item.taxon.name : "unknown";
  const isSpecies = item.taxon && item.taxon.rank === "species";
  const wasReviewed = reviewedIds.includes( item.id );
  // TODO: fix whatever funkiness is preventing realm mapTo from correctly
  // displaying camelcased item keys on ObservationList

  // TODO: add fallback image when there is no uri
  const imageUri = Observation.projectUri( item );

  const createIdentificationMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => createIdentification( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        const ids = Array.from( reviewedIds );
        ids.push( item.id );
        setReviewedIds( ids );
      }
    }
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
      style={[
        viewStyles.gridItem,
        wasReviewed && viewStyles.markReviewed
      ]}
      testID={`ObsList.gridItem.${item.uuid}`}
      accessibilityRole="link"
      accessibilityLabel={t( "Navigate-to-observation-details" )}
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
            level="focus"
            onPress={agreeWithObservation}
            text={t( "agree" )}
            testID="Identify.agree"
            disabled={wasReviewed}
          />
        )}
      </View>
    </Pressable>
  );
};

export default GridItem;
