// @flow
import { View } from "components/styledComponents";
import { t } from "i18next";
import CasualGrade from "images/svg/casualGrade.svg";
import NeedsIdGrade from "images/svg/needsIdGrade.svg";
import ResearchGrade from "images/svg/researchGrade.svg";
import * as React from "react";

type Props = {
  qualityGrade: ?string,
  color: boolean
}

const qualityGradeSVG = ( qualityGrade, color ) => {
  if ( qualityGrade === "research" ) {
    return (
    // $FlowIgnore
      <ResearchGrade
        color={color}
      />
    );
  }
  if ( qualityGrade === "needs_id" ) {
    return (
    // $FlowIgnore
      <NeedsIdGrade
        color={color}
      />
    );
  }
  return (
    // $FlowIgnore
    <CasualGrade
      color={color}
    />
  );
};

const QualityGradeStatus = ( { qualityGrade, color }: Props ): React.Node => {
  const setAccessibilityLabel = () => (
    ( qualityGrade ) ? `Quality-Grade-${qualityGrade}` : t( "Quality-Grade-No-Grade" ) );

  return (
    <View
      accessible
      accessibilityLabel={t( setAccessibilityLabel() )}
    >
      {qualityGradeSVG( qualityGrade, color )}

    </View>
  );
};

export default QualityGradeStatus;
