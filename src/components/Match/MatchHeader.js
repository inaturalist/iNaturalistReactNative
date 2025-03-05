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
import { RealmContext } from "providers/contexts.ts";
import React, { useCallback } from "react";
import { useTaxon, useTranslation } from "sharedHooks";

const { useRealm } = RealmContext;

type Props = {
  firstSuggestion: Object,
  taxon: Object
}

const MatchHeader = ( { firstSuggestion, taxon }: Props ) => {
  const { t } = useTranslation( );
  const realm = useRealm( );
  const { taxon: localTaxon } = useTaxon( taxon, true );
  const usableTaxon = localTaxon || taxon;

  console.log( taxon, "Taxon" );

  const confidence = calculateConfidence( firstSuggestion );

  const hasSeenSpecies = usableTaxon?.id
    ? realm.objects( "Observation" )
      .filtered( `taxon.id == ${usableTaxon.id} && taxon.rank_level == 10` )[0]
    : false;

  const taxonId = usableTaxon?.id || "unknown";

  const showSuggestedTaxon = useCallback( ( ) => (
    <View className="shrink">
      <DisplayTaxonName
        taxon={usableTaxon}
        testID={`ObsDetails.taxon.${taxonId}`}
        accessibilityHint={t( "Navigates-to-taxon-details" )}
        topTextComponent={Heading1}
        bottomTextComponent={Subheading2}
      />
    </View>
  ), [t, usableTaxon, taxonId] );

  const observationStatus = ( ) => {
    let confidenceType = "may_have_observed";
    if ( confidence >= 93 ) {
      confidenceType = "observed";
    } else if ( confidence >= 50 && confidence < 93 ) {
      confidenceType = "likely_observed";
    }

    let rankDescription = "organism";
    if ( taxon.rank_level === 10 ) {
      if ( !hasSeenSpecies ) {
        rankDescription = "new_species";
      } else {
        rankDescription = "species";
      }
    }

    return { confidenceType, rankDescription };
  };

  const generateCongratulatoryText = ( ) => {
    let congratulatoryText;
    const { confidenceType, rankDescription } = observationStatus( );

    if ( confidenceType === "observed" ) {
      if ( rankDescription === "new_species" ) {
        congratulatoryText = t( "You-observed-a-new-species" );
      } else if ( rankDescription === "species" ) {
        congratulatoryText = t( "You-observed-a-species" );
      } else if ( rankDescription === "organism" ) {
        congratulatoryText = t( "You-observed-an-organism-in-this-group" );
      }
    }
    if ( confidenceType === "likely_observed" ) {
      if ( rankDescription === "new_species" ) {
        congratulatoryText = t( "You-likely-observed-a-new-species" );
      } else if ( rankDescription === "species" ) {
        congratulatoryText = t( "You-likely-observed-a-species" );
      } else if ( rankDescription === "organism" ) {
        congratulatoryText = t( "You-likely-observed-an-organism-in-this-group" );
      }
    }
    if ( confidenceType === "may_have_observed" ) {
      if ( rankDescription === "new_species" ) {
        congratulatoryText = t( "You-may-have-observed-a-new-species" );
      } else if ( rankDescription === "species" ) {
        congratulatoryText = t( "You-may-have-observed-a-species" );
      } else if ( rankDescription === "organism" ) {
        congratulatoryText = t( "You-may-have-observed-an-organism-in-this-group" );
      }
    }
    return congratulatoryText;
  };

  if ( !firstSuggestion ) {
    return (
      <Body2>
        {t( "iNaturalist-couldnt-identify-this-organism" )}
      </Body2>
    );
  }

  return (
    <View>
      <Body2 className="mb-2">{generateCongratulatoryText( )}</Body2>
      <View className="flex-row justify-between items-center">
        {showSuggestedTaxon( )}
        <View className="justify-end items-center ml-5">
          <Subheading2 className="text-inatGreen mb-2">
            {t( "X-percent", { count: confidence } )}
          </Subheading2>
          <Body4 className="text-inatGreen">
            {t( "Confidence--label" )}
          </Body4>
        </View>
      </View>
    </View>
  );
};

export default MatchHeader;
