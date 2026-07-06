import NumericFieldInput from "components/AddToProjects/FieldInputs/NumericFieldInput";
import { Body1, Body3, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import type { RealmObservationField, RealmProjectObservationField } from "realmModels/types";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  projectObservationField: RealmProjectObservationField;
  isValid: boolean;
}
const ObservationFieldInput = ( { projectObservationField, isValid }: Props ) => {
  const { t } = useTranslation( );

  const renderInput = ( obsField?: RealmObservationField ) => {
    if ( !obsField ) return null;
    const obsFieldId = obsField.id;

    switch ( obsField.datatype ) {
      case "numeric":
        return <NumericFieldInput obsFieldId={obsFieldId} />;
      case "text":
      case "dna":
        return (
          <Body3 className="pt-1 color-darkGrayDisabled">
            {t( "Enter-a-response" )}
          </Body3>
        );
      case "date":
        return (
          <Body3 className="pt-1 color-darkGrayDisabled">
            {t( "Choose-a-date" )}
          </Body3>
        );
      case "time":
        return (
          <Body3 className="pt-1 color-darkGrayDisabled">
            {t( "Choose-a-time" )}
          </Body3>
        );
      case "datetime":
        return (
          <Body3 className="pt-1 color-darkGrayDisabled">
            {t( "Choose-a-date-time" )}
          </Body3>
        );
      case "taxon":
        return (
          <Body3 className="pt-1 color-darkGrayDisabled">
            {t( "Select-a-species" )}
          </Body3>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 px-4 py-2.5" key={projectObservationField.id}>
      <View className="flex-1 flex-row justify-between items-center">
        <Body1 className="flex-1">
          {projectObservationField.obsField?.name}
        </Body1>
        {projectObservationField.required && (
          <View className="flex-row">
            <Body3 className="mr-2.5">{t( "Required" )}</Body3>
            {isValid
              ? (
                <INatIcon
                  name="checkmark-circle"
                  color={colors.inatGreen}
                  size={19}
                />
              )
              : (
                <INatIcon
                  name="triangle-exclamation"
                  color={colors.warningRed}
                  size={19}
                />
              )}
          </View>
        )}
      </View>
      {renderInput( projectObservationField.obsField )}
    </View>
  );
};

export default ObservationFieldInput;
