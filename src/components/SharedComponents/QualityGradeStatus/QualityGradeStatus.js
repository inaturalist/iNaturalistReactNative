// @flow
import { Pressable } from "components/styledComponents";
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
        accessible
        accessibilityLabel={t( "Quality-Grade-research" )}
        color={color}
      />
    );
  }
  if ( qualityGrade === "needs_id" ) {
    return (
    // $FlowIgnore
      <NeedsIdGrade
        accessible
        accessibilityLabel={t( "Quality-Grade-needs_id" )}
        color={color}
      />
    );
  }
  return (
    // $FlowIgnore
    <CasualGrade
      accessible
      accessibilityLabel={t( "Quality-Grade-casual" )}
      color={color}
    />
  );
};

const QualityGradeStatus = ( { qualityGrade, color }: Props ): React.Node => (
  <Pressable accessibilityRole="button">{qualityGradeSVG( qualityGrade, color )}</Pressable>
);

export default QualityGradeStatus;
