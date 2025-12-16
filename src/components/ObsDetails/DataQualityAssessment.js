// @flow
import DQAVoteButtons from "components/ObsDetails/DetailsTab/DQAVoteButtons";
import {
  Body1,
  Body3,
  Divider,
  Heading4,
  INatIcon,
  List2,
  OfflineNotice,
  ScrollViewWrapper,
  ViewWrapper,
} from "components/SharedComponents";
// eslint-disable-next-line max-len
import QualityGradeStatus from "components/SharedComponents/QualityGradeStatus/QualityGradeStatus";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import colors from "styles/tailwindColors";

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
type Props = {
  checkTest: Function,
  ifMajorityAgree: Function,
  isConnected?: boolean,
  loadingAgree: boolean,
  loadingDisagree: boolean,
  loadingMetric: string,
  qualityGrade: string,
  qualityMetrics: Object,
  recheckisConnected: Function,
  removeMetricVote: Function,
  removeNeedsIDVote: Function,
  setMetricVote: Function,
  setNeedsIDVote: Function,
}

const DataQualityAssessment = ( {
  checkTest,
  ifMajorityAgree,
  isConnected,
  loadingAgree,
  loadingDisagree,
  loadingMetric,
  qualityGrade,
  qualityMetrics,
  recheckisConnected,
  removeMetricVote,
  removeNeedsIDVote,
  setMetricVote,
  setNeedsIDVote,
}: Props ): Node => {
  const isResearchGrade = qualityGrade === "research";
  const sectionClass = "flex-row my-[14px] space-x-[11px]";
  const voteClass = "flex-row mr-[15px] my-[7px] justify-between";
  const listTextClass = "flex-row shrink space-x-[11px] mr-[11px] items-center";

  const renderMetricIndicator = metric => {
    const ifAgree = ifMajorityAgree( metric );
    if ( ifAgree || ifAgree === null ) {
      return (
        <INatIcon
          testID="DQA.pass"
          name="checkmark-circle"
          size={19}
          color={colors.inatGreen}
        />
      );
    }
    return (
      <INatIcon
        name="triangle-exclamation"
        size={19}
        color={colors.warningRed}
      />
    );
  };

  const renderIndicator = metric => {
    const ifAgree = checkTest( metric );
    if ( ifAgree || ifAgree === null ) {
      return (
        <INatIcon name="checkmark-circle" size={19} color={colors.inatGreen} /> );
    }
    return (
      <INatIcon
        name="triangle-exclamation"
        size={19}
        color={colors.warningRed}
      />
    );
  };

  if ( isConnected === false ) {
    return (
      <ViewWrapper>
        <OfflineNotice onPress={( ) => recheckisConnected( )} />
      </ViewWrapper>
    );
  }

  // console.log( "[DEBUG DataQualityAssessment.js] qualityMetrics?.date: ", qualityMetrics?.date );

  return (
    <ScrollViewWrapper testID="DataQualityAssessment">
      <View className="mx-[26px] my-[19px] space-y-[9px]">
        <QualityGradeStatus
          qualityGrade={qualityGrade}
          color={
            qualityGrade === "research"
              ? colors.inatGreen
              : colors.darkGray
          }
        />
        <View className="flex-row space-x-[7px]">
          {isResearchGrade && (
            <INatIcon
              name="checkmark-circle"
              size={19}
              color={colors.inatGreen}
            />
          )}
          <Body1 className="text-darkGray">{titleOption( qualityGrade )}</Body1>
        </View>
        <List2 className="text-darkGray">{titleDescription( qualityGrade )}</List2>
      </View>
      <Divider />
      <View className="mx-[15px]">
        <View className={sectionClass}>
          {renderIndicator( "date" )}
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
          <Body3>
            {t( "Data-quality-assessment-id-supported-by-two-or-more" )}
          </Body3>
        </View>
        <Divider />

        <View className={sectionClass}>
          {renderIndicator( "rank" )}
          <Body3>
            {t(
              "Data-quality-assessment-community-taxon-species-level-or-lower",
            )}
          </Body3>
        </View>
        <Divider />

        <View className={voteClass}>
          <View className={listTextClass}>
            {renderMetricIndicator( "date" )}
            <Body3>{t( "Data-quality-assessment-date-is-accurate" )}</Body3>
          </View>
          <DQAVoteButtons
            metric="date"
            votes={qualityMetrics?.date}
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
            votes={qualityMetrics?.location}
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
            votes={qualityMetrics?.wild}
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
            votes={qualityMetrics?.evidence}
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
            <Body3>
              {t( "Data-quality-assessment-recent-evidence-of-organism" )}
            </Body3>
          </View>
          <DQAVoteButtons
            metric="recent"
            votes={qualityMetrics?.recent}
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
            {renderMetricIndicator( "subject" )}
            <Body3>{t( "Data-quality-assessment-single-subject" )}</Body3>
          </View>
          <DQAVoteButtons
            metric="subject"
            votes={qualityMetrics?.subject}
            setVote={setMetricVote}
            loadingAgree={loadingAgree}
            loadingDisagree={loadingDisagree}
            loadingMetric={loadingMetric}
            removeVote={removeMetricVote}
          />
        </View>
        <Divider />

      </View>

      <View className="flex-row items-center mt-5 py-2 pl-4 pr-[30px] bg-lightGray">
        <Body3 className="flex-1 mr-1">
          {t(
            "Data-quality-assessment-can-taxon-still-be-confirmed-improved-based-on-the-evidence",
          )}
        </Body3>
        <DQAVoteButtons
          metric="needs_id"
          votes={qualityMetrics?.needs_id}
          setVote={setNeedsIDVote}
          loadingAgree={loadingAgree}
          loadingDisagree={loadingDisagree}
          loadingMetric={loadingMetric}
          removeVote={removeNeedsIDVote}
        />
      </View>

      <View className="my-[30px] mx-[15px] space-y-[11px]">
        <Heading4>{t( "ABOUT-THE-DQA" )}</Heading4>
        <List2>{t( "About-the-DQA-description" )}</List2>
      </View>
    </ScrollViewWrapper>
  );
};

export default DataQualityAssessment;
