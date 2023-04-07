// @flow
import { View } from "components/styledComponents";
import { t } from "i18next";
import CasualGrade from "images/svg/casualGrade.svg";
import NeedsIdGrade from "images/svg/needsIdGrade.svg";
import ResearchGrade from "images/svg/researchGrade.svg";
import * as React from "react";
import { useTheme } from "react-native-paper";

type Props = {
  qualityGrade: ?string,
  color?: boolean
}

const qualityGradeSVG = ( qualityGrade, color ) => {
  if ( qualityGrade === "research" ) {
    return (
    // $FlowIgnore
      <ResearchGrade
        accessible
        accessibilityLabel={t( "Quality-Grade-research" )}
        testID="QualityGrade.research"
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
        testID="QualityGrade.needs_id"
        color={color}
      />
    );
  }
  return (
    // $FlowIgnore
    <CasualGrade
      accessible
      accessibilityLabel={t( "Quality-Grade-casual" )}
      testID="QualityGrade.casual"
      color={color}
    />
  );
};

const QualityGradeStatus = ( { qualityGrade, color }: Props ): React.Node => {
  const theme = useTheme();
  const svgColor = color || theme.colors.primary;
  return (
    <View>{qualityGradeSVG( qualityGrade, svgColor )}</View>
  );
};

export default QualityGradeStatus;
