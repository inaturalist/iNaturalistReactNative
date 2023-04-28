// @flow

import { useNavigation } from "@react-navigation/native";
import ObsImagePreview from "components/MyObservations/ObsImagePreview";
import { DisplayTaxonName } from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  IconButton,
  useTheme
} from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  item: Object,
  createId: Function
};

const TaxonResult = ( { item: taxon, createId }: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const theme = useTheme( );
  const taxonImage = { uri: taxon?.default_photo?.url };

  return (
    <View
      className="flex-row items-center justify-between border-[0.5px] pl-3 py-1 border-lightGray"
      testID={`Search.taxa.${taxon.id}`}
    >
      <Pressable
        className="flex-row items-center w-16 grow"
        onPress={() => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
        accessible
        accessibilityRole="link"
        accessibilityLabel={t( "Navigate-to-taxon-details" )}
        accessibilityValue={{ text: taxon.name }}
        accessibilityState={{ disabled: false }}
      >
        <ObsImagePreview
          source={taxonImage}
          testID={`Search.taxa.${taxon.id}.photo`}
        />
        <View className="shrink ml-3">
          <DisplayTaxonName
            taxon={taxon}
            layout="horizontal"
          />
        </View>
      </Pressable>
      <View className="flex-row items-center">
        <IconButton
          icon="info-circle-outline"
          size={22}
          onPress={() => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
          accessibilityRole="link"
          accessibilityLabel={t( "Navigate-to-taxon-details" )}
          accessibilityState={{ disabled: false }}
        />
        <IconButton
          icon="checkmark-circle"
          size={40}
          iconColor={theme.colors.secondary}
          onPress={( ) => createId( taxon )}
          accessibilityRole="button"
          accessibilityLabel={t( "Add-this-ID" )}
          accessibilityState={{ disabled: false }}
        />
      </View>
    </View>
  );
};

export default TaxonResult;
