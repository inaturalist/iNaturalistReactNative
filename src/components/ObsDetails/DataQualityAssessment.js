// @flow
import { useRoute } from "@react-navigation/native";
import { fetchQualityMetrics, setQualityMetric } from "api/qualityMetrics";
import {
  Body3,
  Divider,
  Heading4,
  INatIcon,
  INatIconButton,
  List1,
  List2,
  ScrollViewWrapper
} from "components/SharedComponents";
import QualityGradeStatus from "components/SharedComponents/QualityGradeStatus/QualityGradeStatus";
import { View } from "components/styledComponents";
import { t } from "i18next";
import { useEffect, useState } from "react";
import * as React from "react";
import { useTheme } from "react-native-paper";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";

const titleOption = option => {
  switch ( option ) {
  case "research":
    return t( "Data-quality-assessment-title-research" );
  case "needs_id":
    return t( "Data-quality-assessment-title-needs-id" );
  default:
    return t( "Data-quality-assessment-title-casual" );
  }
};

const titleDescription = option => {
  switch ( option ) {
  case "research":
    return t( "Data-quality-assessment-description-research" );
  case "needs_id":
    return t( "Data-quality-assessment-description-needs-id" );
  default:
    return t( "Data-quality-assessment-description-casual" );
  }
};

const DataQualityAssessment = ( ): React.Node => {
  const { params } = useRoute( );
  const { observationUUID } = params;
  const { qualityGrade } = params;
  const isResearchGrade = qualityGrade === "research";
  const theme = useTheme( );
  const sectionClass = "flex-row ml-[15px] my-[14px] space-x-[11px]";
  const voteClass = "flex-row mx-[15px] my-[7px] justify-between items-center";
  const listTextClass = "flex-row space-x-[11px]";
  const [qualityMetrics, setQualityMetrics] = useState( [] );

  const createFetchQualityMetricMutation = useAuthenticatedMutation(
    ( PARAMS, optsWithAuth ) => fetchQualityMetrics( PARAMS, optsWithAuth ),
    {
      onSuccess: response => {
        setQualityMetrics( response );
      },
      onError: error => {
        console.log( "error", error );
      }
    }
  );
  useEffect( ( ) => {
    if ( qualityMetrics.length === 0 ) {
      createFetchQualityMetricMutation.mutate( { id: observationUUID, fields: "metric,agree" } );
    }
    // createFetchQualityMetricMutation.mutate( { id: observationUUID, fields: "metric,agree" } );
  }, [createFetchQualityMetricMutation, qualityMetrics, observationUUID] );

  const createQualityMetricMutation = useAuthenticatedMutation(
    ( PARAMS, optsWithAuth ) => setQualityMetric( PARAMS, optsWithAuth ),
    {
      onSuccess: response => {
        console.log( "success", response );
      },
      onError: error => {
        console.log( "error", error );
      }
    }
  );

  const setMetricVote = ( metric, vote ) => {
    const PARAMS = {
      id: observationUUID,
      metric,
      agree: vote
    };
    createQualityMetricMutation.mutate( PARAMS );
  };

  const checkTest = metric => {
    const match = qualityMetrics.find( element => element.metric === metric );
    if ( match && match.agree === true ) { return true; }
    if ( match && match.agree === false ) { return false; }
    return null;
  };

  const renderIndicator = metric => {
    const ifAgree = checkTest( metric );
    if ( ifAgree || ifAgree === null ) {
      return (
        <INatIcon name="checkmark-circle" size={19} color={theme.colors.secondary} /> );
    }
    return (
      <INatIcon name="triangle-exclamation" size={19} color={theme.colors.error} />
    );
  };

  const renderVoteButtons = metric => {
    const ifAgree = checkTest( metric );
    if ( ifAgree === null ) { // no vote made yet
      return (
        <View className="flex-row">
          <INatIconButton
            icon="arrow-up-bold-circle-outline"
            size={33}
            onPress={() => setMetricVote( metric, true )}
          />
          <INatIconButton
            icon="arrow-down-bold-circle-outline"
            size={33}
            onPress={() => setMetricVote( metric, false )}
          />
        </View>
      );
    }

    return (
      <View className="flex-row">
        {ifAgree // if vote true
          ? (
            <INatIconButton
              icon="arrow-up-bold-circle"
              size={33}
              color={theme.colors.secondary}
            />
          )
          : (
            <INatIconButton
              icon="arrow-up-bold-circle-outline"
              size={33}
              onPress={() => setMetricVote( metric, true )}
            />
          )}
        {!ifAgree // if vote false
          ? (
            <INatIconButton
              icon="arrow-down-bold-circle"
              size={33}
              color={theme.colors.error}
            />
          )
          : (
            <INatIconButton
              icon="arrow-down-bold-circle-outline"
              size={33}
              onPress={() => setMetricVote( metric, false )}
            />
          )}
      </View>
    );
  };

  return (
    <ScrollViewWrapper testID="DataQualityAssessment">
      <View className="mx-[26px] my-[19px] space-y-[9px]">
        <QualityGradeStatus
          qualityGrade={qualityGrade}
          color={( qualityGrade === "research" )
            ? theme.colors.secondary : theme.colors.primary}
        />
        <View className="flex-row space-x-[7px]">
          {isResearchGrade
          && (
            <INatIcon
              name="checkmark-circle"
              size={19}
              color={theme.colors.secondary}
            />
          )}
          <List1 className="text-black">
            {titleOption( qualityGrade )}
          </List1>
        </View>
        <List2 className="text-black">
          {titleDescription( qualityGrade )}
        </List2>
      </View>
      <Divider />

      <View className={sectionClass}>
        {renderIndicator( ) }
        <Body3>{t( "Data-quality-assessment-date-specified" )}</Body3>
      </View>
      <Divider />

      <View className={sectionClass}>
        {renderIndicator( )}
        <Body3>{t( "Data-quality-assessment-location-specified" )}</Body3>
      </View>
      <Divider />

      <View className={sectionClass}>
        {renderIndicator()}
        <Body3>{t( "Data-quality-assessment-has-photos-or-sounds" )}</Body3>
      </View>
      <Divider />

      <View className={sectionClass}>
        {renderIndicator()}
        <Body3>{t( "Data-quality-assessment-id-supported-by-two-or-more" )}</Body3>
      </View>
      <Divider />

      <View className={sectionClass}>
        {renderIndicator()}
        <Body3>{t( "Data-quality-assessment-community-taxon-at-species-level-or-lower" )}</Body3>
      </View>
      <Divider />

      <View className={voteClass}>
        <View className={listTextClass}>
          {renderIndicator( "date" )}
          <Body3>{t( "Data-quality-assessment-date-is-accurate" )}</Body3>
        </View>
        {renderVoteButtons( "date" )}
      </View>
      <Divider />

      <View className={voteClass}>
        <View className={listTextClass}>
          {renderIndicator( "location" )}
          <Body3>{t( "Data-quality-assessment-location-is-accurate" )}</Body3>
        </View>
        {renderVoteButtons( "location" )}
      </View>
      <Divider />

      <View className={voteClass}>
        <View className={listTextClass}>
          {renderIndicator( "wild" )}
          <Body3>{t( "Data-quality-assessment-organism-is-wild" )}</Body3>
        </View>
        {renderVoteButtons( "wild" )}
      </View>
      <Divider />

      <View className={voteClass}>
        <View className={listTextClass}>
          {renderIndicator( "evidence" )}
          <Body3>{t( "Data-quality-assessment-evidence-of-organism" )}</Body3>
        </View>
        {renderVoteButtons( "evidence" )}
      </View>
      <Divider />

      <View className={voteClass}>
        <View className={listTextClass}>
          {renderIndicator( "recent" )}
          <Body3>{t( "Data-quality-assessment-recent-evidence-of-organism" )}</Body3>
        </View>
        {renderVoteButtons( "recent" )}
      </View>
      <Divider />

      <View className="flex-row bg-lightGray px-[15px] py-[7px] mt-[20px]">
        <Body3 className="shrink">
          {t(
            "Data-quality-assessment-can-taxon-still-be-confirmed-improved-based-on-the-evidence"
          )}
        </Body3>
        {renderVoteButtons( "needs_id" )}
      </View>

      <View className="mt-[30px] mx-[15px] space-y-[11px]">
        <Heading4>{t( "ABOUT-THE-DQA" )}</Heading4>
        <List2>{t( "About-the-DQA-description" )}</List2>
      </View>

    </ScrollViewWrapper>
  );
};

export default DataQualityAssessment;
