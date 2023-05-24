// @flow

import createIdentification from "api/identifications";
import { markAsReviewed } from "api/observations";
import PlaceholderText from "components/PlaceholderText";
import type { Node } from "react";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import TinderCard from "react-tinder-card";
import Observation from "realmModels/Observation";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import { imageStyles, textStyles, viewStyles } from "styles/identify/identify";

type Props = {
  observationList: Array<Object>,
}

const CardSwipeView = ( { observationList }: Props ): Node => {
  const [totalSwiped, setTotalSwiped] = useState( 0 );

  const reviewMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => markAsReviewed( { id }, optsWithAuth )
  );

  const createIdentificationMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => createIdentification( params, optsWithAuth )
  );

  const onSwipe = async ( direction, id, isSpecies, agreeParams ) => {
    if ( direction === "left" ) {
      reviewMutation.mutate( id );
    } else if ( direction === "right" && isSpecies ) {
      createIdentificationMutation.mutate( { identification: agreeParams } );
    }
  };

  const onCardLeftScreen = ( ) => {
    setTotalSwiped( totalSwiped + 1 );
    // TODO: when total swiped is 30, fetch next page of observations
  };

  if ( observationList.length === 0 ) {
    return null;
  }

  return (
    <View style={viewStyles.cardContainer}>
      <PlaceholderText text="Swipe left to mark as reviewed." />
      <PlaceholderText text="Swipe right to agree." />
      {observationList.map( obs => {
        const commonName = obs.taxon && obs.taxon.preferred_common_name;
        const name = obs.taxon
          ? obs.taxon.name
          : "unknown";
        const isSpecies = obs.taxon && obs.taxon.rank === "species";
        const imageUri = Observation.mediumUri( obs );
        const preventSwipeDirections = ["up", "down"];
        if ( !isSpecies ) {
          preventSwipeDirections.push( "right" );
        }
        const agreeParams = { observation_id: obs.uuid, taxon_id: obs.taxon?.id };

        return (
          <TinderCard
            key={obs.id}
            onSwipe={dir => onSwipe( dir, obs.uuid, isSpecies, agreeParams )}
            onCardLeftScreen={onCardLeftScreen}
            preventSwipe={preventSwipeDirections}
          >
            <View style={viewStyles.card}>
              <Image style={imageStyles.cardImage} source={imageUri} />
              {commonName && <Text style={textStyles.commonNameText}>{commonName}</Text>}
              <Text style={textStyles.text}>{name}</Text>
            </View>
          </TinderCard>
        );
      } )}
    </View>
  );
};

export default CardSwipeView;
