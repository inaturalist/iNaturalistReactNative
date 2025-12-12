import classnames from "classnames";
import { Body3, Button, DisplayTaxonName } from "components/SharedComponents";
import { View } from "components/styledComponents";
import _ from "lodash";
import React, { useState } from "react";
import { useCurrentUser, useTranslation } from "sharedHooks";

interface Props {
  rule: object;
}

const ProjectRuleItem = ( { rule }: Props ) => {
  const [hideFullList, setHideFullList] = useState(
    rule.inclusions.length > 20
    || rule.exclusions.length > 20
  );
  const currentUser = useCurrentUser( );
  const { t } = useTranslation( );

  const totalRuleCount = rule.inclusions.length + rule.exclusions.length;

  const viewAllButtonText = {
    Taxa: t( "VIEW-ALL-X-TAXA", { count: totalRuleCount } ),
    Users: t( "VIEW-ALL-X-USERS", { count: totalRuleCount } ),
    Projects: t( "VIEW-ALL-X-PROJECTS", { count: totalRuleCount } ),
    Location: t( "VIEW-ALL-X-PLACES", { count: totalRuleCount } )
  };

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
      key={rule.name === "Taxa"
        ? `${rule.name}-${item?.taxon?.name}`
        : `${rule.name}-${item?.text}`}
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
        {!_.isEmpty( rule?.inclusions ) && showRules( hideFullList
          ? _.take( rule?.inclusions, 20 )
          : rule?.inclusions )}
        {( !_.isEmpty( rule?.exclusions ) && !hideFullList ) && (
          <>
            <Body3 className="flex-row pb-1">{t( "except" )}</Body3>
            {showRules( rule?.exclusions )}
          </>
        )}
        {hideFullList && (
          <Button
            text={viewAllButtonText[rule.name]}
            onPress={( ) => setHideFullList( false )}
            className="my-3"
          />
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
