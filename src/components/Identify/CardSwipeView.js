// @flow

import React, { useState } from "react";
import { Text, View, Image } from "react-native";
import type { Node } from "react";
import TinderCard from "react-tinder-card";

import { viewStyles, imageStyles, textStyles } from "../../styles/identify/identify";
import Observation from "../../models/Observation";
import markAsReviewed from "./helpers/markAsReviewed";
import createIdentification from "./helpers/createIdentification";
import PlaceholderText from "../PlaceholderText";

type Props = {
  observationList: Array<Object>,
}

const CardSwipeView = ( { observationList }: Props ): Node => {
  const [totalSwiped, setTotalSwiped] = useState( 0 );
  const onSwipe = async ( direction, id, isSpecies, agreeParams ) => {
    if ( direction === "left" ) {
      markAsReviewed( id );
    } else if ( direction === "right" && isSpecies ) {
      const agreed = await createIdentification( agreeParams );
      console.log( agreed, "agreed in card swipe" );
    }
    console.log( `You swiped: ${direction}` );
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
        const name = obs.taxon ? obs.taxon.name : "unknown";
        const isSpecies = obs.taxon && obs.taxon.rank === "species";
        const imageUri = Observation.mediumUri( obs );
        const preventSwipeDirections = ["up", "down"];
        if ( !isSpecies ) {
          preventSwipeDirections.push( "right" );
        }
        const agreeParams = { observation_id: obs.uuid, taxon_id: obs.taxon.id };

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
