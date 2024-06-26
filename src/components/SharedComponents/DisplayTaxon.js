// @flow

import classnames from "classnames";
import { DisplayTaxonName, IconicTaxonIcon } from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React from "react";
import { accessibleTaxonName } from "sharedHelpers/taxon";
import { useCurrentUser, useTranslation } from "sharedHooks";

const { useRealm } = RealmContext;

type Props = {
  accessibilityHint?: string,
  accessibilityLabel?: string,
  handlePress: Function,
  taxon: Object,
  testID?: string,
  withdrawn?: boolean
}

const DisplayTaxon = ( {
  accessibilityHint,
  accessibilityLabel,
  handlePress,
  taxon,
  testID,
  withdrawn
}: Props ): Node => {
  const realm = useRealm( );
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );

  const imageClassName = "w-[62px] h-[62px] rounded-lg";

  const iconicTaxonName = taxon?.isIconic
    ? taxon.name
    : taxon?.iconic_taxon_name;

  const iconicTaxon = iconicTaxonName && realm?.objects( "Taxon" )
    .filtered( "name CONTAINS[c] $0", iconicTaxonName );

  const taxonPhoto = taxon?.default_photo?.url || iconicTaxon?.[0]?.default_photo?.url;
  const accessibleName = accessibleTaxonName( taxon, currentUser, t );

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center shrink"
      onPress={handlePress}
      testID={testID}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel || accessibleName}
    >
      <View className="justify-between flex-row items-center w-full">
        <View className="flex-row items-center">
          {taxonPhoto
            ? (
              <Image
                source={{ uri: taxonPhoto }}
                className={classnames(
                  imageClassName,
                  {
                    "opacity-50": withdrawn
                  }
                )}
                accessibilityIgnoresInvertColors
                testID="DisplayTaxon.image"
              />
            )
            : (
              <IconicTaxonIcon
                imageClassName={imageClassName}
                iconicTaxonName={iconicTaxonName}
              />
            )}
          <View className="ml-3 shrink">
            <DisplayTaxonName
              taxon={taxon}
              withdrawn={withdrawn}
              scientificNameFirst={currentUser?.prefers_scientific_name_first}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default DisplayTaxon;
