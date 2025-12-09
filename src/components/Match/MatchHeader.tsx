import type { ApiSuggestion } from "api/types";
import calculateConfidence from "components/Match/calculateConfidence";
import {
  Body2,
  Body4,
  DisplayTaxonName,
  Heading1,
  Subheading2
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  topSuggestion?: ApiSuggestion;
  hideObservationStatus?: boolean
}

const MatchHeader = ( { topSuggestion, hideObservationStatus }: Props ) => {
  const { t } = useTranslation( );
  const taxon = topSuggestion?.taxon;

  if ( !topSuggestion ) {
    return null;
  }

  const confidence = calculateConfidence( topSuggestion );

  const suggestedTaxon = taxon;

  const observationStatus = ( ) => {
    let confidenceType = "may_have_observed";
    if ( confidence ) {
      if ( confidence >= 93 ) {
        confidenceType = "observed";
      } else if ( confidence >= 50 && confidence < 93 ) {
        confidenceType = "likely_observed";
      }
    }

    let rankDescription = "organism";
    if ( taxon?.rank_level === 10 ) {
      rankDescription = "species";
    }

    return { confidenceType, rankDescription };
  };

  const generateCongratulatoryText = ( ) => {
    let congratulatoryText;
    const { confidenceType, rankDescription } = observationStatus( );

    if ( confidenceType === "observed" ) {
      if ( rankDescription === "species" ) {
        congratulatoryText = t( "You-observed-this-species" );
      } else if ( rankDescription === "organism" ) {
        congratulatoryText = t( "You-observed-a-species-in-this-group" );
      }
    }
    if ( confidenceType === "likely_observed" ) {
      if ( rankDescription === "species" ) {
        congratulatoryText = t( "You-likely-observed-this-species" );
      } else if ( rankDescription === "organism" ) {
        congratulatoryText = t( "You-likely-observed-a-species-in-this-group" );
      }
    }
    if ( confidenceType === "may_have_observed" ) {
      if ( rankDescription === "species" ) {
        congratulatoryText = t( "You-may-have-observed-this-species" );
      } else if ( rankDescription === "organism" ) {
        congratulatoryText = t( "You-may-have-observed-a-species-in-this-group" );
      }
    }
    return congratulatoryText;
  };

  const showSuggestedTaxon = ( ) => (
    <View className="shrink">
      <DisplayTaxonName
        taxon={suggestedTaxon}
        topTextComponent={Heading1}
        bottomTextComponent={Subheading2}
      />
    </View>
  );

  return (
    <View>
      {!hideObservationStatus && <Body2 className="mb-2">{generateCongratulatoryText( )}</Body2>}
      <View className="flex-row justify-between items-center">
        {showSuggestedTaxon( )}
        { !hideObservationStatus && (
          <View className="justify-end items-center ml-5">
            <Subheading2 className="text-inatGreen mb-2">
              {t( "X-percent", { count: confidence } )}
            </Subheading2>
            <Body4 className="text-inatGreen">
              {t( "Confidence--label" )}
            </Body4>
          </View>
        )}
      </View>
    </View>
  );
};

export default MatchHeader;
