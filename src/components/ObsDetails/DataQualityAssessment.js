// @flow
import DQAVoteButtons from "components/ObsDetails/DetailsTab/DQAVoteButtons";
import PlaceholderText from "components/PlaceholderText";
import {
  Body3,
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
import type { Node } from "react";
import React, {
} from "react";
import { useTheme } from "react-native-paper";

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
  qualityMetrics: Object,
  loadingAgree: boolean,
  loadingDisagree: boolean,
  loadingMetric: string,
  qualityGrade: string,
  ifMajorityAgree: Function,
  checkTest: Function,
  setMetricVote: Function,
  removeMetricVote: Function
}

const DataQualityAssessment = ( {
  qualityMetrics,
  loadingAgree,
  loadingDisagree,
  loadingMetric,
  qualityGrade,
  ifMajorityAgree,
  checkTest,
  setMetricVote,
  removeMetricVote
}: Props ): Node => {
  const isResearchGrade = qualityGrade === "research";
  const theme = useTheme( );
  const sectionClass = "flex-row my-[14px] space-x-[11px]";
  const voteClass = "flex-row mr-[15px] my-[7px] justify-between items-center";
  const listTextClass = "flex-row space-x-[11px]";

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
  );
};

export default DataQualityAssessment;
