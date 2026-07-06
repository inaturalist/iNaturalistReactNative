import { Body3 } from "components/SharedComponents";
import { Pressable } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  obsFieldId: number;
}

const TaxonFieldInput = ( { obsFieldId }: Props ) => {
  const { t } = useTranslation( );
  console.log( "obsFieldId", obsFieldId );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={( ) => console.log( "press" )}
    >
      <Body3 className="pt-1 color-darkGrayDisabled">
        {t( "Select-a-species" )}
      </Body3>
    </Pressable>
  );
};

export default TaxonFieldInput;
