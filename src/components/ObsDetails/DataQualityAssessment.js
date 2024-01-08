// @flow
import { useRoute } from "@react-navigation/native";
import { deleteQualityMetric, fetchQualityMetrics, setQualityMetric } from "api/qualityMetrics";
import DQAVoteButtons from "components/ObsDetails/DetailsTab/DQAVoteButtons";
import PlaceholderText from "components/PlaceholderText";
import {
  Body3,
  BottomSheet,
  Button,
  Divider,
  Heading4,
  INatIcon,
  List1,
  List2,
  ScrollViewWrapper
} from "components/SharedComponents";
import QualityGradeStatus from "components/SharedComponents/QualityGradeStatus/QualityGradeStatus";
import { View } from "components/styledComponents";
import { t } from "i18next";
import {
  useEffect, useState
} from "react";
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
  const { observationUUID, observation, qualityGrade } = params;
  const isResearchGrade = qualityGrade === "research";
  const theme = useTheme( );
  const sectionClass = "flex-row my-[14px] space-x-[11px]";
  const voteClass = "flex-row mr-[15px] my-[7px] justify-between items-center";
  const listTextClass = "flex-row space-x-[11px]";
  const [qualityMetrics, setQualityMetrics] = useState( null );
  const [loadingAgree, setLoadingAgree] = useState( false );
  const [loadingDisagree, setLoadingDisagree] = useState( false );
  const [loadingMetric, setLoadingMetric] = useState( null );
  const [hideErrorSheet, setHideErrorSheet] = useState( true );

  const fetchMetricsParams = {
    id: observationUUID,
    fields: "metric,agree,user_id",
    ttl: -1
  };

  // destructured mutate to pass into useEffect to prevent infinite
  // rerender and disabling eslint useEffect dependency rule
  const { mutate } = useAuthenticatedMutation(
    ( qualityMetricParams, optsWithAuth ) => fetchQualityMetrics(
      qualityMetricParams,
      optsWithAuth
    ),
    {
      onSuccess: response => {
        setLoadingMetric( null );
        if ( loadingAgree ) {
          setLoadingAgree( false );
        }
        if ( loadingDisagree ) {
          setLoadingDisagree( false );
        }
        setQualityMetrics( response );
      },
      onError: () => {
        setHideErrorSheet( false );
      }
    }
  );

  useEffect( ( ) => {
    mutate( {
      id: params.observationUUID,
      fields: "metric,agree,user_id",
      ttl: -1
    } );
  }, [mutate, params] );

  const createQualityMetricMutation = useAuthenticatedMutation(
    ( qualityMetricParams, optsWithAuth ) => setQualityMetric( qualityMetricParams, optsWithAuth ),
    {
      onSuccess: () => {
        // fetch updated quality metrics with updated votes
        mutate( fetchMetricsParams );
      },
      onError: () => {
        setHideErrorSheet( false );
      }
    }
  );

  const setMetricVote = ( metric, vote ) => {
    const qualityMetricParams = {
      id: observationUUID,
      metric,
      agree: vote,
      ttyl: -1
    };
    setLoadingMetric( metric );
    if ( vote ) {
      setLoadingAgree( true );
    } else {
      setLoadingDisagree( true );
    }
    createQualityMetricMutation.mutate( qualityMetricParams );
  };

  const createRemoveQualityMetricMutation = useAuthenticatedMutation(
    ( qualityMetricParams, optsWithAuth ) => deleteQualityMetric(
      qualityMetricParams,
      optsWithAuth
    ),
    {
      onSuccess: () => {
        // fetch updated quality metrics with updated votes
        mutate( fetchMetricsParams );
      },
      onError: () => {
        setHideErrorSheet( false );
      }
    }
  );

  const removeMetricVote = ( metric, vote ) => {
    const qualityMetricParams = {
      id: observationUUID,
      metric,
      ttyl: -1
    };
    setLoadingMetric( metric );
    if ( vote ) {
      setLoadingAgree( true );
    } else {
      setLoadingDisagree( true );
    }
    createRemoveQualityMetricMutation.mutate( qualityMetricParams );
  };

  const ifMajorityAgree = metric => {
    if ( qualityMetrics ) {
      const agreeCount = qualityMetrics.filter(
        element => ( element.agree && element.metric === metric )
      ).length;
      const disagreeCount = qualityMetrics.filter(
        element => ( !element.agree && element.metric === metric )
      ).length;

      return agreeCount >= disagreeCount;
    }
    return null;
  };

  const renderMetricIndicator = metric => {
    const ifAgree = ifMajorityAgree( metric );
    if ( ifAgree || ifAgree === null ) {
      return (
        <INatIcon
          testID="DQA.pass"
          name="checkmark-circle"
          size={19}
          color={theme.colors.secondary}
        />
      );
    }
    return (
      <INatIcon
        name="triangle-exclamation"
        size={19}
        color={theme.colors.error}
      />
    );
  };

  const checkTest = metric => {
    if ( observation ) {
      if ( metric === "date" ) {
        return observation[metric] !== null;
      }
      if ( metric === "location" ) {
        const removedNull = observation[metric]
          .filter( value => ( value !== null ) );
        return removedNull.length !== 0;
      }
      if ( metric === "evidence" ) {
        const removedEmpty = observation[metric]
          .filter( value => ( Object.keys( value ).length !== 0 ) );
        return removedEmpty.length !== 0;
      }
      if ( observation.taxon ) {
        if ( metric === "id_supported" ) {
          const taxonId = observation.taxon.id;
          const supportedIDs = observation.identifications.filter(
            identification => ( identification.taxon.id === taxonId )
          ).length;
          return supportedIDs >= 2;
        }
        if ( metric === "rank" && observation.taxon.rank_level <= 10 ) {
          return true;
        }
      }
    }
    return false;
  };

  const renderIndicator = metric => {
    const ifAgree = checkTest( metric );
    if ( ifAgree || ifAgree === null ) {
      return (
        <INatIcon name="checkmark-circle" size={19} color={theme.colors.secondary} /> );
    }
    return (
      <INatIcon
        name="triangle-exclamation"
        size={19}
        color={theme.colors.error}
      />
    );
  };

  return (
    <>
      <ScrollViewWrapper testID="DataQualityAssessment">
        <View className="mx-[26px] my-[19px] space-y-[9px]">
          <QualityGradeStatus
            qualityGrade={qualityGrade}
            color={( qualityGrade === "research" )
              ? theme.colors.secondary
              : theme.colors.primary}
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
        <View className="mx-[15px]">
          <View className={sectionClass}>
            {renderIndicator( "date" ) }
            <Body3>{t( "Data-quality-assessment-date-specified" )}</Body3>
          </View>
          <Divider />

          <View className={sectionClass}>
            {renderIndicator( "location" )}
            <Body3>{t( "Data-quality-assessment-location-specified" )}</Body3>
          </View>
          <Divider />

          <View className={sectionClass}>
            {renderIndicator( "evidence" )}
            <Body3>{t( "Data-quality-assessment-has-photos-or-sounds" )}</Body3>
          </View>
          <Divider />

          <View className={sectionClass}>
            {renderIndicator( "id_supported" )}
            <Body3>{t( "Data-quality-assessment-id-supported-by-two-or-more" )}</Body3>
          </View>
          <Divider />

          <View className={sectionClass}>
            {renderIndicator( "rank" )}
            <Body3>{t( "Data-quality-assessment-community-taxon-species-level-or-lower" )}</Body3>
          </View>
          <Divider />

          <View className={voteClass}>
            <View className={listTextClass}>
              {renderMetricIndicator( "date" )}
              <Body3>{t( "Data-quality-assessment-date-is-accurate" )}</Body3>
            </View>
            <DQAVoteButtons
              metric="date"
              qualityMetrics={qualityMetrics}
              setVote={setMetricVote}
              loadingAgree={loadingAgree}
              loadingDisagree={loadingDisagree}
              loadingMetric={loadingMetric}
              removeVote={removeMetricVote}
            />
          </View>
          <Divider />

          <View className={voteClass}>
            <View className={listTextClass}>
              {renderMetricIndicator( "location" )}
              <Body3>{t( "Data-quality-assessment-location-is-accurate" )}</Body3>
            </View>
            <DQAVoteButtons
              metric="location"
              qualityMetrics={qualityMetrics}
              setVote={setMetricVote}
              loadingAgree={loadingAgree}
              loadingDisagree={loadingDisagree}
              loadingMetric={loadingMetric}
              removeVote={removeMetricVote}
            />
          </View>
          <Divider />

          <View className={voteClass}>
            <View className={listTextClass}>
              {renderMetricIndicator( "wild" )}
              <Body3>{t( "Data-quality-assessment-organism-is-wild" )}</Body3>
            </View>
            <DQAVoteButtons
              metric="wild"
              qualityMetrics={qualityMetrics}
              setVote={setMetricVote}
              loadingAgree={loadingAgree}
              loadingDisagree={loadingDisagree}
              loadingMetric={loadingMetric}
              removeVote={removeMetricVote}
            />
          </View>
          <Divider />

          <View className={voteClass}>
            <View className={listTextClass}>
              {renderMetricIndicator( "evidence" )}
              <Body3>{t( "Data-quality-assessment-evidence-of-organism" )}</Body3>
            </View>
            <DQAVoteButtons
              metric="evidence"
              qualityMetrics={qualityMetrics}
              setVote={setMetricVote}
              loadingAgree={loadingAgree}
              loadingDisagree={loadingDisagree}
              loadingMetric={loadingMetric}
              removeVote={removeMetricVote}
            />
          </View>
          <Divider />

          <View className={voteClass}>
            <View className={listTextClass}>
              {renderMetricIndicator( "recent" )}
              <Body3>{t( "Data-quality-assessment-recent-evidence-of-organism" )}</Body3>
            </View>
            <DQAVoteButtons
              metric="recent"
              qualityMetrics={qualityMetrics}
              setVote={setMetricVote}
              loadingAgree={loadingAgree}
              loadingDisagree={loadingDisagree}
              loadingMetric={loadingMetric}
              removeVote={removeMetricVote}
            />
          </View>
          <Divider />
        </View>

        <View className="flex-row bg-lightGray px-[15px] py-[7px] mt-[20px]">
          <PlaceholderText text="TODO" />
          <Body3 className="shrink">
            {t(
              "Data-quality-assessment-can-taxon-still-be-confirmed-improved-based-on-the-evidence"
            )}
          </Body3>
          <DQAVoteButtons
            metric="needs_id"
            qualityMetrics={qualityMetrics}
            setVote={setMetricVote}
            loadingAgree={loadingAgree}
            loadingDisagree={loadingDisagree}
            loadingMetric={loadingMetric}
            removeVote={removeMetricVote}
          />
        </View>

        <View className="mt-[30px] mx-[15px] space-y-[11px]">
          <Heading4>{t( "ABOUT-THE-DQA" )}</Heading4>
          <List2>{t( "About-the-DQA-description" )}</List2>
        </View>

      </ScrollViewWrapper>
      <BottomSheet
        headerText={t( "ERROR-VOTING-IN-DQA" )}
        hidden={hideErrorSheet}
        hideCloseButton
      >
        <View className="px-[26px] py-[20px] flex-col space-y-[20px]">
          <List2 className="text-black">{t( "Error-voting-in-DQA-description" )}</List2>
          <Button
            text={t( "OK" )}
            onPress={() => setHideErrorSheet( true )}
          />
        </View>
      </BottomSheet>
    </>
  );
};

export default DataQualityAssessment;
