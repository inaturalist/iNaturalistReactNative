import classnames from "classnames";
import { Body3, DisplayTaxonName } from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import React from "react";
import { useCurrentUser, useTranslation } from "sharedHooks";

interface Props {
  rule: Object
}

const ProjectRuleItem = ( { rule }: Props ) => {
  const currentUser = useCurrentUser( );
  const { t } = useTranslation( );

  const showTaxonName = taxon => (
    <DisplayTaxonName
      prefersCommonNames={currentUser?.prefers_common_names}
      removeStyling
      scientificNameFirst={currentUser?.prefers_scientific_name_first}
      small
      taxon={taxon}
    />
  );

  const showRules = ruleType => ruleType.map( item => (
    <Body3
      key={`${rule.name}-${item?.text}` || item?.taxon?.name}
      className={classnames(
        "pb-2 flex-row",
        {
          underline: item?.onPress
        }
      )}
      onPress={item?.onPress}
    >
      {item?.text}
      {item?.taxon && showTaxonName( item?.taxon )}
    </Body3>
  ) );

  const showRuleDetails = ( ) => {
    if ( _.isEmpty( rule?.inclusions ) && _.isEmpty( rule?.exclusions ) ) {
      return showRules( rule?.defaults );
    }
    return (
      <>
        {!_.isEmpty( rule?.inclusions ) && showRules( rule?.inclusions )}
        {!_.isEmpty( rule?.exclusions ) && (
          <>
            <Body3 className="flex-row pb-1">{t( "except" )}</Body3>
            {showRules( rule?.exclusions )}
          </>
        )}
      </>
    );
  };

  return (
    <View className="flex-row px-4">
      <Body3 className="w-1/3 pt-2">{rule.name}</Body3>
      <View className="pt-2 pb-1 w-2/3">
        {showRuleDetails( )}
      </View>
    </View>
  );
};

export default ProjectRuleItem;
