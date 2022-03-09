// @flow

import React from "react";
import { Text, View, Image } from "react-native";
import type { Node } from "react";
import TinderCard from "react-tinder-card";

import { viewStyles, imageStyles, textStyles } from "../../styles/identify/identify";
import Observation from "../../models/Observation";

type Props = {
  loading: boolean,
  observationList: Array<Object>,
  testID: string
}

const CardSwipeView = ( { loading, observationList, testID }: Props ): Node => {
  const onSwipe = ( direction ) => {
    console.log( "You swiped: " + direction );
  };

  const onCardLeftScreen = ( myIdentifier ) => {
    console.log( myIdentifier + " left the screen" );
  };

  if ( observationList.length === 0 ) {
    return null;
  }

  return (
    <View style={viewStyles.cardContainer}>
      {observationList.map( obs => {
        const commonName = obs.taxon && obs.taxon.preferred_common_name;
        const name = obs.taxon ? obs.taxon.name : "unknown";
        const imageUri = Observation.mediumUri( obs );
        return (
          <TinderCard
            key={obs.id}
            onSwipe={onSwipe}
            onCardLeftScreen={() => onCardLeftScreen( "fooBar" )}
            preventSwipe={["right", "left"]}
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
