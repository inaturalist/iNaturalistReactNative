// @flow
import { View } from "components/styledComponents";
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
    // $FlowIgnore
    return <ResearchGrade color={color} />;
  }
  if ( qualityGrade === "needs_id" ) {
    // $FlowIgnore
    return <NeedsIdGrade color={color} />;
  }
  // $FlowIgnore
  return <CasualGrade color={color} />;
};

const QualityGradeStatus = ( { qualityGrade, color }: Props ): React.Node => (
  <View>
    { qualityGradeSVG( qualityGrade, color )}
  </View>

);

export default QualityGradeStatus;
