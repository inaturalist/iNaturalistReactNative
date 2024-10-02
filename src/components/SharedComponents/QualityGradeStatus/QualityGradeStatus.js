// @flow
import { View } from "components/styledComponents";
import { t } from "i18next";
import CasualGrade from "images/svg/casual_grade.svg";
import NeedsIdGrade from "images/svg/needs_id_grade.svg";
import ResearchGrade from "images/svg/research_grade.svg";
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
    // $FlowIgnore[not-a-component]
      <ResearchGrade
        accessible
        accessibilityLabel={t( "Quality-Grade-Research--label" )}
        testID="QualityGrade.research"
        color={color}
        opacity={opacity}
      />
    );
  }
  if ( qualityGrade === "needs_id" ) {
    return (
    // $FlowIgnore[not-a-component]
      <NeedsIdGrade
        accessible
        accessibilityLabel={t( "Quality-Grade-Needs-ID--label" )}
        testID="QualityGrade.needs_id"
        color={color}
        opacity={opacity}
      />
    );
  }
  return (
    // $FlowIgnore[not-a-component]
    <CasualGrade
      accessible
      accessibilityLabel={t( "Quality-Grade-Casual--label" )}
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
