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
  color?: boolean,
  opacity?: boolean
}

const qualityGradeSVG = ( qualityGrade, color, opacity ) => {
  if ( qualityGrade === "research" ) {
    return (
    // $FlowIgnore
      <ResearchGrade
        accessible
        accessibilityLabel={t( "Quality-Grade-research" )}
        testID="QualityGrade.research"
        color={color}
        opacity={opacity}
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
        opacity={opacity}
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
      opacity={opacity}
    />
  );
};

const QualityGradeStatus = ( { qualityGrade, color, opacity }: Props ): React.Node => {
  const theme = useTheme();
  const svgColor = color || theme.colors.primary;
  const svgOpacity = opacity || 1;
  return (
    <View>{qualityGradeSVG( qualityGrade, svgColor, svgOpacity )}</View>
  );
};

export default QualityGradeStatus;
