import { Body3 } from "components/SharedComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  obsFieldId: number;
}

const TaxonFieldInput = ( { obsFieldId }: Props ) => {
  const { t } = useTranslation( );
  console.log( "obsFieldId", obsFieldId );

  return (
    <Body3 className="pt-1 color-darkGrayDisabled">
      {t( "Select-a-species" )}
    </Body3>
  );
};

export default TaxonFieldInput;
