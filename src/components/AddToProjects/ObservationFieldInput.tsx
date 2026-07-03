import { Body1, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import type { RealmProjectObservationField } from "realmModels/types";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  projectObservationField: RealmProjectObservationField;
  isValid: boolean;
}
const ObservationFieldInput = ( { projectObservationField, isValid }: Props ) => {
  const { t } = useTranslation( );
  return (
    <View className="flex-1 px-4 py-2.5" key={projectObservationField.id}>
      <View className="flex-1 flex-row justify-between items-center">
        <Body1 className="flex-1">
          {projectObservationField.obsField?.name}
        </Body1>
        {projectObservationField.required && (
          <View className="flex-row">
            <Body1 className="mr-2.5">{t( "Required" )}</Body1>
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
    </View>
  );
};

export default ObservationFieldInput;
